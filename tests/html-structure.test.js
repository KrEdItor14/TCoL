'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = [
  'index.html',
  'www/index.html',
  'android/app/src/main/assets/public/index.html',
].filter(file => fs.existsSync(path.join(root, file)));

function fail(file, message) {
  throw new Error(`${file}: ${message}`);
}

function attributes(tag) {
  const result = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = pattern.exec(tag))) {
    const name = match[1].toLowerCase();
    if (name === 'label' || name === 'input' || name === 'select' || name === 'textarea' || name === 'button') continue;
    result[name] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return result;
}

for (const relativeFile of htmlFiles) {
  const html = fs.readFileSync(path.join(root, relativeFile), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const ids = new Map();
  const controls = new Set();
  const idPattern = /<([a-z][\w:-]*)\b([^>]*)>/gi;
  let match;
  while ((match = idPattern.exec(html))) {
    const tagName = match[1].toLowerCase();
    const attrs = attributes(`<${tagName}${match[2]}>`);
    if (attrs.id) {
      if (ids.has(attrs.id)) fail(relativeFile, `duplicate id "${attrs.id}"`);
      ids.set(attrs.id, tagName);
    }
    if (['input', 'select', 'textarea', 'button'].includes(tagName) && attrs.id) controls.add(attrs.id);
  }

  const labelPattern = /<label\b([^>]*)>([\s\S]*?)<\/label\s*>/gi;
  while ((match = labelPattern.exec(html))) {
    const attrs = attributes(`<label${match[1]}>`);
    const body = match[2];
    if (attrs.for) {
      if (!ids.has(attrs.for)) fail(relativeFile, `label for="${attrs.for}" has no matching id`);
      if (!controls.has(attrs.for)) fail(relativeFile, `label for="${attrs.for}" does not reference a form control`);
      continue;
    }

    const nestedControls = [...body.matchAll(/<(input|select|textarea)\b[^>]*>/gi)];
    if (nestedControls.length !== 1) {
      fail(relativeFile, `label must contain exactly one input/select/textarea (found ${nestedControls.length})`);
    }
  }

  const settingsIds = [
    'panel-settings',
    'panel-settings-ai',
    'themeGrid',
    'soundEnabledToggle',
    'notificationsEnabledToggle',
    'aiThemePickBtn',
    'aiThemeSelect',
    'aiThemeDescription',
    'aiBillingInfo',
    'aiOwnKeyBlock',
    'aiOwnKeyInput',
    'aiModelPickBtn',
    'aiModelSelect',
    'aiModelDescription',
    'aiModelCostHint',
    'aiStatusSettings',
  ];
  for (const id of settingsIds) {
    if (!ids.has(id)) fail(relativeFile, `settings interface is missing "${id}"`);
  }
  if (ids.has('aiCheckBtn')) fail(relativeFile, 'AI settings must not expose the manual connection-check button');
  if (html.indexOf('id="aiStatusSettings"') > html.indexOf('id="aiThemePickBtn"')) {
    fail(relativeFile, 'AI status must appear before the other AI settings');
  }
  const aiSettingsHeading = html.indexOf('<h3>🤖 Настройки AI</h3>');
  const nextSettingsCard = html.indexOf('<div class="card">', aiSettingsHeading + 1);
  const aiSettingsCard = html.slice(aiSettingsHeading, nextSettingsCard);
  if (aiSettingsHeading < 0 || !aiSettingsCard.includes('id="aiStatusSettings"') ||
      !aiSettingsCard.includes('Генерация квестов, предметов и текста с помощью AI.')) {
    fail(relativeFile, 'AI status and settings description must share the same card');
  }
  const tookenMentions = [...html.matchAll(/Tooken/g)];
  const personalKeyCopy = 'AI-генерации используют ваш личный ключ Tooken.';
  if (tookenMentions.length !== 1 || !html.includes(personalKeyCopy)) {
    fail(relativeFile, 'AI settings must explain that a personal Tooken key is required');
  }
}

if (!htmlFiles.includes('index.html')) fail('index.html', 'source HTML is missing');
console.log(`html-structure: PASS (${htmlFiles.join(', ')})`);
