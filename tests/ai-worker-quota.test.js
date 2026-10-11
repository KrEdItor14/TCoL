"use strict";
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const { webcrypto } = require('crypto');

class TestDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}

let now = 1_800_000_000_000;

class MemoryKv {
  constructor() { this.entries = new Map(); this.version = 0; }
  keyId(key) { return JSON.stringify(key); }
  async get(key) {
    const entry = this.entries.get(this.keyId(key));
    return entry ? { value: entry.value, versionstamp: entry.versionstamp } : { value: null, versionstamp: null };
  }
  atomic() {
    const checks = [];
    let pendingWrite = null;
    const transaction = {
      check: item => { checks.push(item); return transaction; },
      set: (key, value) => { pendingWrite = { key, value }; return transaction; },
      commit: async () => {
        await Promise.resolve();
        for (const check of checks) {
          const actual = this.entries.get(this.keyId(check.key));
          if ((actual?.versionstamp ?? null) !== check.versionstamp) return { ok: false };
        }
        if (pendingWrite) {
          this.version++;
          this.entries.set(this.keyId(pendingWrite.key), {
            value: pendingWrite.value,
            versionstamp: String(this.version)
          });
        }
        return { ok: true };
      }
    };
    return transaction;
  }
}

const kv = new MemoryKv();
let handler;
let lastUpstreamRequest = null;
const context = {
  console,
  Date: TestDate,
  Math,
  JSON,
  Number,
  String,
  Object,
  Array,
  Promise,
  TextEncoder,
  URL,
  Response,
  Request,
  crypto: webcrypto,
  fetch: async (_url, init) => {
    lastUpstreamRequest = init;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 });
  },
  Deno: {
    serve(value) { handler = value; },
    env: { get(name) { return name === 'PROXY_SECRET' ? 'test-secret' : 'test-api-key'; } },
    async openKv() { return kv; }
  }
};
vm.createContext(context);
const workerSource = fs.readFileSync('js/worker.js', 'utf8');
vm.runInContext(`${workerSource}\nglobalThis.__quota = { readQuota, reserveQuota, settleQuota, quotaKey, normalizeRecord, quotaStatus, hasSuccessfulAIResponse };`, context);

async function request(path, method = 'GET', body = undefined, deviceId = 'device-a') {
  const headers = { 'X-Proxy-Secret': 'test-secret' };
  if (deviceId) headers['X-Device-Id'] = deviceId;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const req = new Request(`https://worker.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return handler(req);
}

(async () => {
  const { readQuota, reserveQuota, settleQuota, quotaKey, normalizeRecord, hasSuccessfulAIResponse } = context.__quota;
  const key = await quotaKey('device-a');
  const beforeWindow = now - 24 * 60 * 60 * 1000;
  const normalized = normalizeRecord({
    successes: [
      { timestamp: beforeWindow },
      { timestamp: beforeWindow + 1 },
      { timestamp: now + 1 }
    ],
    reservations: [{ id: 'expired', createdAt: now, expiresAt: now - 1 }]
  }, now);
  assert.strictEqual(normalized.successes.length, 1);
  assert.strictEqual(normalized.reservations.length, 0);
  assert.strictEqual(hasSuccessfulAIResponse('{"choices":[{"message":{"content":"{\\"ok\\":true}"}}]}'), true);
  assert.strictEqual(hasSuccessfulAIResponse('{"choices":[{"message":{"content":"not json"}}]}'), false);

  const simultaneous = await Promise.all(Array.from({ length: 12 }, () => reserveQuota(kv, key)));
  assert.strictEqual(simultaneous.filter(item => item.ok).length, 10);
  assert.strictEqual(simultaneous.filter(item => !item.ok).length, 2);
  let status = await readQuota(kv, key);
  assert.strictEqual(status.used, 0);
  assert.strictEqual(status.remaining, 0);
  context.fetch = async () => { throw new Error('AI provider must not be called after quota exhaustion'); };
  let response = await request('/', 'POST', { model: 'test', messages: [] }, 'device-a');
  assert.strictEqual(response.status, 429);
  assert.strictEqual((await response.json()).code, 'FREE_LIMIT_EXCEEDED');

  const held = status.record.reservations[0].id;
  let settled = await settleQuota(kv, key, held, false);
  assert.strictEqual(settled.used, 0);
  assert.strictEqual(settled.remaining, 1);

  status = await readQuota(kv, key);
  const successfulReservation = status.record.reservations[0].id;
  settled = await settleQuota(kv, key, successfulReservation, true);
  assert.strictEqual(settled.used, 1);
  assert.strictEqual(settled.remaining, 1);
  now += 24 * 60 * 60 * 1000;
  status = await readQuota(kv, key);
  assert.strictEqual(status.used, 0);
  assert.strictEqual(status.remaining, 10);

  context.fetch = async () => new Response('upstream failed', { status: 503 });
  response = await request('/', 'POST', { model: 'test', messages: [] }, 'device-b');
  assert.strictEqual(response.status, 503);
  response = await request('/quota', 'GET', undefined, 'device-b');
  status = await response.json();
  assert.strictEqual(status.used, 0);
  assert.strictEqual(status.remaining, 10);
  assert.strictEqual(status.policy, 'rolling-24h-10');

  context.fetch = async (_url, init) => {
    lastUpstreamRequest = init;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 });
  };
  response = await request('/', 'POST', { model: 'test', messages: [] }, 'device-c');
  assert.strictEqual(response.headers.get('X-Quota-Policy'), 'rolling-24h-10');
  const reservation = response.headers.get('X-Quota-Reservation');
  assert.ok(reservation);
  const ownDeviceKey = await quotaKey('device-c');
  status = await readQuota(kv, ownDeviceKey);
  assert.strictEqual(status.used, 1);
  assert.strictEqual(status.remaining, 9);
  response = await request('/quota/settle', 'POST', { reservation, commit: true }, 'device-c');
  status = await response.json();
  assert.strictEqual(status.used, 1);
  assert.strictEqual(status.remaining, 9);

  context.fetch = async (_url, init) => {
    lastUpstreamRequest = init;
    return new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }), { status: 200 });
  };
  await request('/', 'POST', { model: 'test', messages: [] }, 'device-e');
  status = await (await request('/quota', 'GET', undefined, 'device-e')).json();
  assert.strictEqual(status.used, 0);
  assert.strictEqual(status.remaining, 10);

  context.fetch = async (_url, init) => {
    lastUpstreamRequest = init;
    return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }), { status: 200 });
  };
  response = await request('/', 'POST', { model: 'test', messages: [], userApiKey: 'user-key' }, 'device-d');
  assert.strictEqual(response.headers.get('X-Quota-Reservation'), null);
  assert.strictEqual(lastUpstreamRequest.headers.Authorization, 'Bearer user-key');
  assert.strictEqual(Object.hasOwn(JSON.parse(lastUpstreamRequest.body), 'userApiKey'), false);
  status = await (await request('/quota', 'GET', undefined, 'device-d')).json();
  assert.strictEqual(status.used, 0);
  assert.strictEqual(status.remaining, 10);

  const legacyKey = ['ai-free-quota', new Date(now).toISOString().slice(0, 10), (await quotaKey('legacy-device'))[1]];
  await kv.atomic().set(legacyKey, { used: 4, reservations: [] }).commit();
  const migrated = await readQuota(kv, await quotaKey('legacy-device'));
  assert.strictEqual(migrated.used, 4);
  assert.strictEqual(migrated.remaining, 6);

  console.log('ai-worker-quota: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
