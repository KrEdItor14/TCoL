"use strict";

const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class FakeElement {
  constructor() {
    this.dataset = {};
    this.listeners = new Map();
    this.style = {};
    this.textContent = '';
    this.checked = false;
    this.children = [];
    this._value = '';
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    for (const listener of this.listeners.get(event.type) || []) listener.call(this, event);
    return true;
  }

  click() {
    for (const listener of this.listeners.get('click') || []) listener.call(this, { type: 'click', target: this });
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  remove() {
    this.removed = true;
  }

  focus() {}

  findByClass(className) {
    if (this.className === className) return this;
    for (const child of this.children) {
      const found = child.findByClass(className);
      if (found) return found;
    }
    return null;
  }
}

class FakeSelect extends FakeElement {
  constructor(options) {
    super();
    this.options = options.map(([value, textContent]) => ({ value, textContent }));
    this.selectedIndex = -1;
  }

  get value() {
    return this.options[this.selectedIndex]?.value || '';
  }

  set value(value) {
    this.selectedIndex = this.options.findIndex(option => option.value === value);
  }

  get selectedOptions() {
    const selected = this.options[this.selectedIndex];
    return selected ? [selected] : [];
  }
}

class FakeThemeGrid extends FakeElement {
  set innerHTML(value) {
    this.html = value;
    this.children = [...value.matchAll(/data-theme-pick="([^"]+)"/g)].map(([, themePick]) => {
      const element = new FakeElement();
      element.dataset.themePick = themePick;
      return element;
    });
  }

  querySelectorAll(selector) {
    assert.strictEqual(selector, '[data-theme-pick]');
    return this.children;
  }
}

const elements = new Map();
const themeValues = [
  ['real_world', 'Реальный мир'],
  ['fantasy', 'Фэнтези'],
  ['sci_fi', 'Научная фантастика'],
  ['post_apocalyptic', 'Постапокалипсис']
];
const modeValues = [['free', 'Бесплатный'], ['own_key', 'Свой ключ']];
const modelValues = [
  ['deepseek-v4.1-flash', 'DeepSeek V4.1 Flash'],
  ['deepseek-v4-flash', 'DeepSeek V4 Pro'],
  ['glm-5.3-flash', 'GLM 5.3 Flash'],
  ['gpt-6-luna', 'GPT-6 Luna'],
  ['gpt-6-astra', 'GPT-6 Astra']
];
for (const id of [
  'aiThemePickBtn', 'aiThemePickLabel', 'aiModePickBtn', 'aiModePickLabel',
  'aiModelPickBtn', 'aiModelPickLabel', 'aiOwnKeyBlock', 'aiOwnKeyInput',
  'aiModelDescription', 'aiModelCostHint',
  'soundEnabledToggle', 'soundEnabledLabel', 'notificationsEnabledToggle',
  'notificationsEnabledLabel', 'aiStatusSettings',
  'aiOwnKeySaveBtn', 'aiOwnKeyClearBtn', 'aiProviderSelect'
]) elements.set(id, new FakeElement());
elements.set('themeGrid', new FakeThemeGrid());
elements.set('aiThemeSelect', new FakeSelect(themeValues));
elements.set('aiModeSelect', new FakeSelect(modeValues));
elements.set('aiModelSelect', new FakeSelect(modelValues));

const state = {
  settings: {
    theme: 'nature',
    soundEnabled: true,
    notificationsEnabled: true,
    aiTheme: 'real_world',
    aiMode: 'free',
    aiProvider: 'tooken',
    aiModel: 'deepseek-v4-flash',
    aiOwnKey: null
  }
};
const savedSettings = [];
const context = {
  console,
  Event,
  state,
  THEMES: [
    { id: 'nature', label: 'Природа', dots: [] },
    { id: 'dark', label: 'Тёмная', dots: [] },
    { id: 'light', label: 'Светлая', dots: [] },
    { id: 'space', label: 'Космос', dots: [] }
  ],
  document: {
    body: new FakeElement(),
    createElement() { return new FakeElement(); },
    documentElement: { setAttribute(name, value) { this[name] = value; } },
    getElementById(id) { return elements.get(id) || null; }
  },
  S() { return state; },
  persist() { savedSettings.push(JSON.parse(JSON.stringify(state.settings))); },
  updateAIStatus() {},
  toast() {},
  aiAvailable: false,
  aiKeyLooksValid: () => false,
  setTimeout,
  clearTimeout
};
vm.createContext(context);
for (const file of ['js/settings-core.js', 'js/ai.js', 'js/settings.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
vm.runInContext('updateAIStatus = function() {};', context);

async function run() {
  const modelOptions = vm.runInContext('AI_MODEL_OPTIONS', context);
  assert.deepStrictEqual(Object.keys(modelOptions), modelValues.map(([value]) => value));
  assert.deepStrictEqual(Object.keys(vm.runInContext('AI_THEME_OPTIONS', context)), themeValues.map(([value]) => value));
  const html = fs.readFileSync('index.html', 'utf8');
  const modelSelectMarkup = html.match(/<select\b[^>]*id="aiModelSelect"[^>]*>([\s\S]*?)<\/select>/);
  assert.ok(modelSelectMarkup, 'AI model selector must exist in the settings HTML');
  const htmlModelValues = [...modelSelectMarkup[1].matchAll(/<option\s+value="([^"]+)"/g)]
    .map(([, value]) => value);
  assert.deepStrictEqual(htmlModelValues, Object.keys(modelOptions));
  context.renderSettings();
  context.wireSettings();

  elements.get('aiThemePickBtn').click();
  const themePicker = context.document.body.children.at(-1);
  const themeOptions = themePicker.findByClass('ai-settings-picker-options').children;
  assert.deepStrictEqual(themeOptions.map(option => option.children[0].textContent), ['Реальный мир', 'Фэнтези', 'Научная фантастика', 'Постапокалипсис']);
  themeOptions[1].click();
  assert.strictEqual(state.settings.aiTheme, 'fantasy');
  assert.strictEqual(elements.get('aiThemeSelect').value, 'fantasy');
  assert.strictEqual(elements.get('aiThemePickLabel').textContent, 'Фэнтези');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiTheme, 'fantasy');

  elements.get('aiThemeSelect').value = 'sci_fi';
  elements.get('aiThemeSelect').dispatchEvent(new Event('change'));
  assert.strictEqual(state.settings.aiTheme, 'sci_fi');
  context.renderSettings();
  assert.strictEqual(elements.get('aiThemeSelect').value, 'sci_fi');
  assert.strictEqual(elements.get('aiThemePickLabel').textContent, 'Научная фантастика');

  elements.get('aiModePickBtn').click();
  assert.strictEqual(state.settings.aiMode, 'own_key');
  assert.strictEqual(elements.get('aiModeSelect').value, 'own_key');
  assert.strictEqual(elements.get('aiOwnKeyBlock').style.display, 'block');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiMode, 'own_key');

  elements.get('aiModelPickBtn').click();
  const modelPicker = context.document.body.children.at(-1);
  const modelPickerOptions = modelPicker.findByClass('ai-settings-picker-options').children;
  assert.deepStrictEqual(modelPickerOptions.map(option => option.children[0].textContent), ['DeepSeek V4.1 Flash', 'DeepSeek V4 Pro', 'GLM 5.3 Flash', 'GPT-6 Luna', 'GPT-6 Astra']);
  assert.deepStrictEqual(modelPickerOptions.map(option => option.children[1].textContent), ['0.25x', '0.3x', '0.35x', '0.5x', '1.8x']);
  modelPickerOptions[0].click();
  assert.strictEqual(state.settings.aiModel, 'deepseek-v4.1-flash');
  assert.strictEqual(elements.get('aiModelSelect').value, 'deepseek-v4.1-flash');
  assert.strictEqual(elements.get('aiModelPickLabel').textContent, 'DeepSeek V4.1 Flash');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiModel, 'deepseek-v4.1-flash');
  context.renderSettings();
  assert.strictEqual(elements.get('aiModelSelect').value, 'deepseek-v4.1-flash');
  assert.strictEqual(elements.get('aiModelPickLabel').textContent, 'DeepSeek V4.1 Flash');
  elements.get('aiModelSelect').value = 'glm-5.3-flash';
  elements.get('aiModelSelect').dispatchEvent(new Event('change'));
  assert.strictEqual(state.settings.aiModel, 'glm-5.3-flash');
  assert.strictEqual(elements.get('aiModelPickLabel').textContent, 'GLM 5.3 Flash');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiModel, 'glm-5.3-flash');
  elements.get('aiModelSelect').value = 'gpt-6-luna';
  elements.get('aiModelSelect').dispatchEvent(new Event('change'));
  assert.strictEqual(state.settings.aiModel, 'gpt-6-luna');
  assert.strictEqual(elements.get('aiModelPickLabel').textContent, 'GPT-6 Luna');
  assert.strictEqual(elements.get('aiModelCostHint').textContent, 'Стоимость: 0.5x от базовой стоимости токенов.');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiModel, 'gpt-6-luna');
  elements.get('aiModelSelect').value = 'gpt-6-astra';
  elements.get('aiModelSelect').dispatchEvent(new Event('change'));
  assert.strictEqual(state.settings.aiModel, 'gpt-6-astra');
  assert.strictEqual(elements.get('aiModelPickLabel').textContent, 'GPT-6 Astra');
  assert.strictEqual(elements.get('aiModelCostHint').textContent, 'Стоимость: 1.8x от базовой стоимости токенов.');
  assert.strictEqual(savedSettings[savedSettings.length - 1].aiModel, 'gpt-6-astra');

  const soundToggle = elements.get('soundEnabledToggle');
  soundToggle.checked = false;
  soundToggle.dispatchEvent(new Event('change'));
  assert.strictEqual(state.settings.soundEnabled, false);
  assert.strictEqual(elements.get('soundEnabledLabel').textContent, 'Выключен');
  assert.strictEqual(savedSettings[savedSettings.length - 1].soundEnabled, false);

  context.Notifications = {
    async cancelRaid() {},
    async requestPermission() { return true; }
  };
  const notificationToggle = elements.get('notificationsEnabledToggle');
  notificationToggle.checked = false;
  notificationToggle.dispatchEvent(new Event('change'));
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(state.settings.notificationsEnabled, false);
  assert.strictEqual(elements.get('notificationsEnabledLabel').textContent, 'Выключены');
  assert.strictEqual(savedSettings[savedSettings.length - 1].notificationsEnabled, false);

  const darkTheme = elements.get('themeGrid').querySelectorAll('[data-theme-pick]')
    .find(element => element.dataset.themePick === 'dark');
  darkTheme.click();
  assert.strictEqual(state.settings.theme, 'dark');
  assert.strictEqual(context.document.documentElement['data-theme'], 'dark');
  assert.strictEqual(savedSettings[savedSettings.length - 1].theme, 'dark');

  console.log('settings-ui: PASS');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
