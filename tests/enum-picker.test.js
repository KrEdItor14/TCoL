'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

class FakeClassList {
  constructor(element) {
    this.element = element;
  }

  toggle(name, force) {
    const names = new Set(this.element.className.split(/\s+/).filter(Boolean));
    const shouldHave = force === undefined ? !names.has(name) : force;
    if (shouldHave) names.add(name);
    else names.delete(name);
    this.element.className = [...names].join(' ');
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = {};
    this.listeners = new Map();
    this.attributes = new Map();
    this.className = '';
    this.classList = new FakeClassList(this);
    this.parentNode = null;
    this.textContent = '';
    this.type = '';
    this.value = '';
  }

  get firstChild() {
    return this.children[0] || null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter(item => item !== child);
    child.parentNode = null;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
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
    this.dispatchEvent({ type: 'click', target: this });
  }

  focus() {
    this.focused = true;
  }

  querySelectorAll(selector) {
    const className = selector.startsWith('.') ? selector.slice(1) : null;
    const matches = [];
    const visit = (element) => {
      for (const child of element.children) {
        if (className && child.className.split(/\s+/).includes(className)) matches.push(child);
        visit(child);
      }
    };
    visit(this);
    return matches;
  }

  findByClass(className) {
    if (this.className.split(/\s+/).includes(className)) return this;
    for (const child of this.children) {
      const found = child.findByClass(className);
      if (found) return found;
    }
    return null;
  }
}

const elements = new Map();
const document = {
  body: new FakeElement('body'),
  createElement(tagName) { return new FakeElement(tagName); },
  getElementById(id) { return elements.get(id) || null; }
};
const target = new FakeElement('input');
target.value = 'common';
elements.set('gearNewRarity', target);

const context = { document, Event, Map };
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/enum-picker.js', 'utf8'), context, { filename: 'js/enum-picker.js' });

context.pickerConfig = {
  targetId: 'gearNewRarity',
  variant: 'modal',
  title: 'Редкость',
  defaultValue: 'common',
  options: [
    { value: 'common', label: 'Обычная', icon: '⚪', tone: 'common' },
    { value: 'legendary', label: 'Легендарная', icon: '🟡', tone: 'legendary' }
  ]
};
const picker = vm.runInContext('EnumPicker.create(pickerConfig)', context);

assert.ok(picker.container.findByClass('enum-picker-trigger'), 'modal variant must render a trigger button');
const trigger = picker.container.findByClass('enum-picker-trigger');
assert.strictEqual(trigger.children.map(child => child.textContent).join(' '), '⚪ Обычная');

trigger.click();
const overlay = document.body.children.at(-1);
assert.ok(overlay.className.includes('enum-picker-overlay'), 'trigger must open an overlay');
const dialog = overlay.findByClass('enum-picker-modal');
assert.strictEqual(dialog.getAttribute('role'), 'dialog');
assert.strictEqual(dialog.getAttribute('aria-modal'), 'true');
assert.strictEqual(dialog.children[0].textContent, 'Редкость');

const close = dialog.findByClass('enum-picker-modal-close');
assert.ok(close.focused, 'opening a modal must move focus to its close button');
const options = dialog.querySelectorAll('.enum-picker-option');
assert.strictEqual(options.length, 2);
assert.ok(options[1].className.includes('enum-picker-option-legendary'), 'option must expose its semantic tone as a class');
assert.strictEqual(options[0].getAttribute('aria-pressed'), 'true');
assert.strictEqual(options[1].getAttribute('aria-pressed'), 'false');

let changes = 0;
target.addEventListener('change', () => { changes += 1; });
options[1].click();
assert.strictEqual(target.value, 'legendary');
assert.strictEqual(changes, 1, 'selecting an option must dispatch one change event');
assert.strictEqual(picker.getValue(), 'legendary');
assert.strictEqual(trigger.children.map(child => child.textContent).join(' '), '🟡 Легендарная');
assert.ok(!document.body.children.includes(overlay), 'modal must close after selection');

trigger.click();
const dismissableOverlay = document.body.children.at(-1);
dismissableOverlay.dispatchEvent({ type: 'click', target: dismissableOverlay });
assert.ok(!document.body.children.includes(dismissableOverlay), 'clicking the overlay must close the modal');

trigger.click();
const closableOverlay = document.body.children.at(-1);
closableOverlay.findByClass('enum-picker-modal-close').click();
assert.ok(!document.body.children.includes(closableOverlay), 'close button must close the modal');

console.log('enum-picker: PASS');
