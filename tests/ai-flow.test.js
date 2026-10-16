"use strict";
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const requests = [];
let responsePayload = { choices: [{ message: { content: '{"ok":true}' } }] };
let responseStatus = 200;
const localStorage = {
  values: new Map(),
  getItem(key) { return this.values.get(key) || null; },
  setItem(key, value) { this.values.set(key, String(value)); }
};

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'Error',
    headers: { get() { return null; } },
    async json() { return payload; }
  };
}

const context = {
  console, Date, Math, JSON, Number, String, Object, Array, Promise, Set,
  TextEncoder, AbortController, URL, URLSearchParams,
  localStorage,
  window: { localStorage, DEBUG_AI: false },
  document: { getElementById() { return null; } },
  state: {
    settings: {
      aiOwnKey: null,
      aiProvider: 'tooken',
      aiModel: 'deepseek-v4-flash'
    }
  },
  fetch: async (url, init = {}) => {
    requests.push({ url, init });
    return response(responsePayload, responseStatus);
  },
  setTimeout, clearTimeout,
  persist() {},
  aiAvailable: false,
  SPECIAL_SKILL_LINKS: {}, SKILL_NAMES: [], SLOT_ORDER: [],
  normalizeConsumableDuration: (_value, fallback) => fallback,
  stateDirty: false
};
vm.createContext(context);
const aiSource = fs.readFileSync('js/ai.js', 'utf8');
const runtimeSource = fs.readFileSync('js/runtime.js', 'utf8');
assert.ok(runtimeSource.includes(aiSource), 'generated runtime must contain the current AI module');
const aiStart = runtimeSource.indexOf('/* ===== js\\ai.js ===== */');
const aiEnd = runtimeSource.indexOf('/* ===== js\\storage.js ===== */', aiStart);
assert.ok(aiStart >= 0 && aiEnd > aiStart, 'generated runtime must include the AI module section');
vm.runInContext(runtimeSource.slice(aiStart, aiEnd), context, { filename: 'js/runtime.js#ai' });
vm.runInContext(
  'this.__queryAI = queryAI; this.__checkAIAvailability = checkAIAvailability; ' +
  'this.__cancelNow = () => { aiCancelRequested = true; };',
  context
);

(async () => {
  const queryAI = context.__queryAI;
  await assert.rejects(queryAI('test'), /личный API-ключ/);
  assert.strictEqual(requests.length, 0);
  assert.strictEqual(await context.__checkAIAvailability(), true);

  context.state.settings.aiOwnKey = '  user-key  ';
  assert.strictEqual(await context.__checkAIAvailability(), true);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(await queryAI('test'))), { ok: true });
  assert.strictEqual(requests.length, 1);

  const request = requests[0];
  assert.strictEqual(request.url, 'https://comfortable-flounder-3259.kreditor14.deno.net');
  assert.strictEqual(request.init.headers['X-Proxy-Secret'], undefined);
  assert.strictEqual(request.init.headers['X-Device-Id'], undefined);
  const body = JSON.parse(request.init.body);
  assert.strictEqual(body.userApiKey, 'user-key');
  assert.strictEqual(body.model, 'deepseek-v4-flash');

  responsePayload = { choices: [{ message: { content: 'not json' } }] };
  await assert.rejects(queryAI('test'), /валидный JSON/);
  assert.strictEqual(requests.length, 2);

  responsePayload = { error: 'invalid API key' };
  responseStatus = 401;
  await assert.rejects(queryAI('test'), /Невалидный API-ключ/);
  assert.strictEqual(requests.length, 3);

  responseStatus = 200;
  responsePayload = { choices: [{ message: { content: '{"ok":true}' } }] };
  const pending = queryAI('test');
  context.__cancelNow();
  await assert.rejects(pending, /отменена/);

  console.log('ai-flow: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
