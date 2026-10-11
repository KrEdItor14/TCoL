"use strict";
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const localStorage = new MemoryStorage();
const statuses = new Map();
let used = 0;
let nextReservation = 0;
let content = '{"ok":true}';
let aiPostCount = 0;
const reservations = new Set();

function response(payload, status = 200, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { get(name) { return headers[name.toLowerCase()] || null; } },
    async json() { return payload; }
  };
}

function quotaStatus() {
  return { used, limit: 10, remaining: Math.max(0, 10 - used - reservations.size), policy: 'rolling-24h-10' };
}

const context = {
  console, Date, Math, JSON, Number, String, Object, Array, Promise, Set,
  TextEncoder, AbortController, URL, URLSearchParams, Buffer: undefined,
  localStorage,
  window: { localStorage, DEBUG_AI: false },
  document: { getElementById(id) { if (!statuses.has(id)) statuses.set(id, { textContent: '', className: '' }); return statuses.get(id); } },
  state: { settings: { aiMode: 'free', aiOwnKey: null, aiProvider: 'tooken', aiModel: 'deepseek-v4-flash' } },
  StorageService: {
    load(key) { return localStorage.getItem(key); },
    save(key, value) { localStorage.setItem(key, value); }
  },
  fetch: async (url, init = {}) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    if (url.endsWith('/quota/settle')) {
      const request = JSON.parse(init.body);
      if (reservations.delete(request.reservation) && request.commit) used++;
      return response(quotaStatus());
    }
    aiPostCount++;
    const id = `reservation-${++nextReservation}`;
    reservations.add(id);
    return response({ choices: [{ message: { content } }] }, 200, {
      'x-quota-policy': 'rolling-24h-10',
      'x-quota-reservation': id
    });
  },
  AbortController,
  setTimeout, clearTimeout,
  persist() {},
  aiAvailable: true,
  SPECIAL_SKILL_LINKS: {}, SKILL_NAMES: [], SLOT_ORDER: [],
  normalizeConsumableDuration: (_value, fallback) => fallback,
  stateDirty: false
};
vm.createContext(context);
for (const file of ['js/ai-free-limit.js', 'js/ai.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
vm.runInContext('this.__queryAI = queryAI; this.__resetCancel = () => { aiCancelRequested = false; }; this.__cancelNow = () => { aiCancelRequested = true; };', context);

(async () => {
  const queryAI = context.__queryAI;
  const freeLimit = context.window.AiFreeLimit;
  freeLimit.debugResetLimit();

  context.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(queryAI('test'), /подтвердить бесплатный лимит/);
  assert.strictEqual(used, 0);

  context.fetch = async (url) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    throw new Error('offline');
  };
  await assert.rejects(queryAI('test'), /связаться с AI-прокси/);
  assert.strictEqual(used, 0);

  context.fetch = async (url, init = {}) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    if (url.endsWith('/quota/settle')) {
      const request = JSON.parse(init.body);
      reservations.delete(request.reservation);
      return response(quotaStatus());
    }
    aiPostCount++;
    const id = `reservation-${++nextReservation}`;
    reservations.add(id);
    return response({ choices: [{ message: { content: 'not json' } }] }, 200, {
      'x-quota-policy': 'rolling-24h-10',
      'x-quota-reservation': id
    });
  };
  await assert.rejects(queryAI('test'), /валидный JSON/);
  assert.strictEqual(used, 0);
  assert.strictEqual(reservations.size, 0);

  content = '{"ok":true}';
  context.fetch = async (url, init = {}) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    if (url.endsWith('/quota/settle')) {
      const request = JSON.parse(init.body);
      if (reservations.delete(request.reservation) && request.commit) used++;
      return response(quotaStatus());
    }
    aiPostCount++;
    const id = `reservation-${++nextReservation}`;
    reservations.add(id);
    return response({ choices: [{ message: { content } }] }, 200, {
      'x-quota-policy': 'rolling-24h-10',
      'x-quota-reservation': id
    });
  };
  assert.deepStrictEqual(JSON.parse(JSON.stringify(await queryAI('test'))), { ok: true });
  assert.strictEqual(used, 1);

  context.state.settings.aiMode = 'own_key';
  context.state.settings.aiOwnKey = 'user-key';
  const postsBeforeOwnKey = aiPostCount;
  context.fetch = async (url, init = {}) => {
    assert.strictEqual(url.endsWith('/quota'), false);
    assert.strictEqual(url.endsWith('/quota/settle'), false);
    assert.strictEqual(JSON.parse(init.body).userApiKey, 'user-key');
    aiPostCount++;
    return response({ choices: [{ message: { content: '{"ok":true}' } }] });
  };
  await queryAI('test');
  assert.strictEqual(aiPostCount, postsBeforeOwnKey + 1);
  assert.strictEqual(used, 1);

  context.state.settings.aiMode = 'free';
  context.state.settings.aiOwnKey = null;
  context.fetch = async (url) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    aiPostCount++;
    return response({ choices: [{ message: { content: '{"ok":true}' } }] }, 200, {
      'x-quota-policy': 'rolling-24h-10'
    });
  };
  await assert.rejects(queryAI('test'), /не зарезервировал квоту/);
  assert.strictEqual(used, 1);

  context.fetch = async (url) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    aiPostCount++;
    return response({ error: 'Не удалось связаться с AI service' }, 502);
  };
  await assert.rejects(queryAI('test'), /Ошибка AI \(502\): Не удалось связаться с AI service/);

  context.fetch = async (url) => {
    if (url.endsWith('/quota')) return response({ used: 10, limit: 10, remaining: 0, policy: 'rolling-24h-10' });
    aiPostCount++;
    throw new Error('AI request must not be sent after quota exhaustion');
  };
  const postsBeforeExhausted = aiPostCount;
  await assert.rejects(queryAI('test'), error => error.code === 'FREE_LIMIT_EXCEEDED');
  assert.strictEqual(aiPostCount, postsBeforeExhausted);

  context.__resetCancel();
  context.fetch = async (url, init = {}) => {
    if (url.endsWith('/quota')) return response(quotaStatus());
    if (url.endsWith('/quota/settle')) {
      reservations.delete(JSON.parse(init.body).reservation);
      return response(quotaStatus());
    }
    const id = `reservation-${++nextReservation}`;
    reservations.add(id);
    context.__cancelNow();
    return response({ choices: [{ message: { content: '{"ok":true}' } }] }, 200, {
      'x-quota-policy': 'rolling-24h-10',
      'x-quota-reservation': id
    });
  };
  await assert.rejects(queryAI('test'), /отменена/);
  assert.strictEqual(reservations.size, 0);

  context.__resetCancel();
  console.log('ai-flow: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
