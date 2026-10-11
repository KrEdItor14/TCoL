// Deno Deploy proxy for the AI service. Configure Deno KV for durable quotas.
const TOOKEN_URL = 'https://tooken.club/v1/chat/completions';
const FREE_LIMIT = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const QUOTA_POLICY = 'rolling-24h-10';
const RESERVATION_TTL_MS = 5 * 60 * 1000;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Proxy-Secret, X-Device-Id, X-Client-Version',
  'Access-Control-Expose-Headers': 'X-Quota-Reservation, X-Quota-Remaining, X-Quota-Policy',
  'Access-Control-Max-Age': '86400'
};

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...CORS, ...headers } });
}

function utcDateKey(date = new Date()) { return date.toISOString().slice(0, 10); }

async function quotaKey(deviceId) {
  const cleanId = typeof deviceId === 'string' ? deviceId.trim().slice(0, 160) : '';
  if (!cleanId) throw new Error('missing_device_id');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cleanId));
  const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return ['ai-free-quota-v2', hash];
}

function normalizeRecord(value, now = Date.now()) {
  const successes = Array.isArray(value?.successes)
    ? value.successes.filter(item => Number.isFinite(Number(item?.timestamp)) && Number(item.timestamp) > now - WINDOW_MS && Number(item.timestamp) <= now)
    : [];
  const reservations = Array.isArray(value?.reservations)
    ? value.reservations.filter(item => item && typeof item.id === 'string' && Number(item.expiresAt) > now && Number(item.createdAt) > now - WINDOW_MS)
    : [];
  return { successes, reservations };
}

function quotaStatus(record, now = Date.now()) {
  const used = record.successes.length;
  const remaining = Math.max(0, FREE_LIMIT - used - record.reservations.length);
  const resetCandidates = [
    ...record.successes.map(item => Number(item.timestamp) + WINDOW_MS),
    ...record.reservations.map(item => Number(item.expiresAt))
  ].filter(timestamp => Number.isFinite(timestamp) && timestamp > now);
  return {
    used,
    limit: FREE_LIMIT,
    remaining,
    resetAt: remaining === 0 && resetCandidates.length ? Math.min(...resetCandidates) : null,
    policy: QUOTA_POLICY
  };
}

function hasValidJsonObject(text) {
  const cleaned = String(text || '')
    .replace(/<\/?(?:think|reasoning)>/gi, '')
    .replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/,\s*([}\]])/g, '$1');

  for (let start = 0; start < cleaned.length; start++) {
    if (cleaned[start] !== '{') continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let index = start; index < cleaned.length; index++) {
      const char = cleaned[index];
      if (inString) {
        if (escape) escape = false;
        else if (char === '\\') escape = true;
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      else if (char === '{') depth++;
      else if (char === '}' && --depth === 0) {
        try {
          const value = JSON.parse(cleaned.slice(start, index + 1));
          if (value && typeof value === 'object' && !Array.isArray(value)) return true;
        } catch {}
        break;
      }
    }
  }
  return false;
}

function hasSuccessfulAIResponse(responseText) {
  try {
    const data = JSON.parse(responseText);
    const choice = data.choices?.[0] || {};
    const message = choice.message || {};
    const content = message.content || message.reasoning_content || message.reasoning || choice.text || '';
    return hasValidJsonObject(content);
  } catch {
    return false;
  }
}

async function migrateLegacyQuota(kv, key, missingEntry, now) {
  const hash = key[1];
  const dates = [utcDateKey(new Date(now)), utcDateKey(new Date(now - WINDOW_MS))];
  const legacyKeys = dates.map(date => ['ai-free-quota', date, hash]);
  const legacyEntries = await Promise.all(legacyKeys.map(legacyKey => kv.get(legacyKey)));
  const legacyUsed = Math.min(FREE_LIMIT, legacyEntries.reduce((total, entry) => {
    const used = Math.trunc(Number(entry.value?.used) || 0);
    return total + Math.max(0, Math.min(FREE_LIMIT, used));
  }, 0));
  const reservations = [];
  for (const entry of legacyEntries) {
    if (!Array.isArray(entry.value?.reservations)) continue;
    for (const reservation of entry.value.reservations) {
      if (reservation && typeof reservation.id === 'string' && Number(reservation.expiresAt) > now &&
          !reservations.some(item => item.id === reservation.id)) {
        reservations.push({ id: reservation.id, createdAt: now, expiresAt: Number(reservation.expiresAt) });
      }
    }
  }
  if (!legacyUsed && !reservations.length) return null;

  const record = normalizeRecord({
    successes: Array.from({ length: legacyUsed }, () => ({ timestamp: now })),
    reservations
  }, now);
  let atomic = kv.atomic().check({ key, versionstamp: missingEntry.versionstamp });
  legacyKeys.forEach((legacyKey, index) => {
    atomic = atomic.check({ key: legacyKey, versionstamp: legacyEntries[index].versionstamp });
  });
  const result = await atomic.set(key, record).commit();
  if (!result.ok) return null;
  return record;
}

async function readQuota(kv, key) {
  let entry = await kv.get(key);
  let record = normalizeRecord(entry.value);
  if (entry.value == null) {
    const migrated = await migrateLegacyQuota(kv, key, entry, Date.now());
    if (migrated) {
      entry = await kv.get(key);
      record = normalizeRecord(entry.value);
    }
  }
  return { entry, record, ...quotaStatus(record) };
}

async function reserveQuota(kv, key) {
  for (let attempt = 0; attempt < 32; attempt++) {
    const { entry, record, remaining } = await readQuota(kv, key);
    if (remaining <= 0) return { ok: false, ...quotaStatus(record) };
    const id = crypto.randomUUID();
    record.reservations.push({ id, createdAt: Date.now(), expiresAt: Date.now() + RESERVATION_TTL_MS });
    const result = await kv.atomic().check({ key, versionstamp: entry.versionstamp }).set(key, record).commit();
    if (result.ok) return { ok: true, id, remaining: remaining - 1 };
  }
  throw new Error('quota_contention');
}

async function settleQuota(kv, key, id, commit) {
  if (typeof id !== 'string' || id.length > 100) return { ok: false, status: 400 };
  for (let attempt = 0; attempt < 32; attempt++) {
    const { entry, record } = await readQuota(kv, key);
    const index = record.reservations.findIndex(item => item.id === id);
    if (index < 0) return { ok: true, alreadySettled: true, ...quotaStatus(record) };
    record.reservations.splice(index, 1);
    if (commit) record.successes.push({ timestamp: Date.now() });
    const result = await kv.atomic().check({ key, versionstamp: entry.versionstamp }).set(key, record).commit();
    if (result.ok) return { ok: true, ...quotaStatus(record) };
  }
  throw new Error('quota_contention');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.headers.get('X-Proxy-Secret') !== Deno.env.get('PROXY_SECRET') || !Deno.env.get('PROXY_SECRET')) return json({ error: 'Неверный секрет' }, 403);

  const url = new URL(req.url);
  const isQuota = url.pathname.endsWith('/quota');
  const isSettle = url.pathname.endsWith('/quota/settle');

  if (isQuota && req.method === 'GET') {
    try {
      const kv = await Deno.openKv();
      const status = quotaStatus((await readQuota(kv, await quotaKey(req.headers.get('X-Device-Id')))).record);
      return json(status);
    } catch (error) {
      console.error('Could not read AI quota:', error);
      return json({ error: error.message === 'missing_device_id' ? 'Device ID required' : 'Quota storage unavailable' }, error.message === 'missing_device_id' ? 400 : 503);
    }
  }

  if (isSettle && req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ error: 'Некорректный JSON запрос' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Некорректный JSON запрос' }, 400);
    try {
      const kv = await Deno.openKv();
      const result = await settleQuota(kv, await quotaKey(req.headers.get('X-Device-Id')), body.reservation, body.commit === true);
      return json({
        used: result.used,
        limit: result.limit,
        remaining: result.remaining,
        resetAt: result.resetAt,
        policy: result.policy,
        alreadySettled: !!result.alreadySettled
      }, result.status || 200);
    } catch (error) {
      console.error('Could not settle AI quota:', error);
      return json({ error: error.message === 'missing_device_id' ? 'Device ID required' : 'Quota storage unavailable' }, error.message === 'missing_device_id' ? 400 : 503);
    }
  }

  if (req.method !== 'POST') return json({ error: 'Только POST' }, 405);
  let body;
  try {
    body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('invalid_request');
  } catch { return json({ error: 'Некорректный JSON запрос' }, 400); }
  const ownKey = typeof body.userApiKey === 'string' ? body.userApiKey.trim() : '';
  delete body.provider;
  delete body.userApiKey;

  let kv;
  let key;
  let reservation;
  if (!ownKey) {
    try {
      kv = await Deno.openKv();
      key = await quotaKey(req.headers.get('X-Device-Id'));
      reservation = await reserveQuota(kv, key);
      if (!reservation.ok) {
        return json({
          error: 'Бесплатный лимит AI исчерпан: 10 успешных запросов за скользящие 24 часа.',
          code: 'FREE_LIMIT_EXCEEDED',
          ...reservation
        }, 429);
      }
    } catch (error) {
      console.error('Could not reserve AI quota:', error);
      return json({ error: error.message === 'missing_device_id' ? 'Device ID required' : 'Серверный лимит AI временно недоступен.' }, error.message === 'missing_device_id' ? 400 : 503);
    }
  }

  try {
    const upstream = await fetch(TOOKEN_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ownKey || Deno.env.get('TOOKEN_API_KEY') || ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await upstream.text();
    if (reservation) {
      const successful = upstream.ok && hasSuccessfulAIResponse(text);
      const settlement = await settleQuota(kv, key, reservation.id, successful);
      if (!settlement.ok) throw new Error('Could not settle AI quota reservation.');
    }
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json', ...CORS,
        'X-Quota-Policy': QUOTA_POLICY,
        ...(reservation ? { 'X-Quota-Reservation': reservation.id, 'X-Quota-Remaining': String(reservation.remaining) } : {})
      }
    });
  } catch (error) {
    if (reservation) {
      try { await settleQuota(kv, key, reservation.id, false); }
      catch (releaseError) { console.error('Could not release interrupted AI request quota reservation:', releaseError); }
    }
    console.error('AI provider request failed:', error);
    return json({ error: 'Не удалось связаться с AI service' }, 502);
  }
});
