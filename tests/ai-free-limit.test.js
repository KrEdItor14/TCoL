"use strict";
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

let now = 1_800_000_000_000;
class TestDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}

const localStorage = new MemoryStorage();
const context = {
  console, Date: TestDate, Math, JSON, Number, String, Object, Array,
  window: { localStorage },
  StorageService: {
    load(key) { return localStorage.getItem(key); },
    save(key, value) { localStorage.setItem(key, value); }
  },
  state: { settings: { aiMode: 'free', aiFreeUsed: 0 } }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/ai-free-limit.js', 'utf8'), context);

const limit = context.window.AiFreeLimit;
assert.strictEqual(limit.getAiFreeLimit(), 10);
assert.strictEqual(limit.getAvailableGenerations(), 10);
for (let i = 0; i < 10; i++) assert.strictEqual(limit.consumeGeneration().ok, true);
assert.strictEqual(limit.canGenerate(), false);
assert.strictEqual(limit.consumeGeneration().ok, false);
assert.strictEqual(limit.getLimitStatus().authoritative, false);

now += 24 * 60 * 60 * 1000;
assert.strictEqual(limit.getAvailableGenerations(), 10);
assert.strictEqual(limit.getLimitStatus().used, 0);

context.state.settings.aiMode = 'own_key';
context.state.settings.aiOwnKey = '  secret  ';
assert.strictEqual(limit.hasUserOwnApiKey(), true);
assert.strictEqual(limit.getAvailableGenerations(), Infinity);
assert.strictEqual(limit.consumeGeneration().unlimited, true);
assert.match(limit.getLimitIndicatorText(), /личного ключа/);

context.state.settings.aiMode = 'free';
context.state.settings.aiOwnKey = 'secret';
assert.strictEqual(limit.hasUserOwnApiKey(), false);

console.log('ai-free-limit: PASS');
