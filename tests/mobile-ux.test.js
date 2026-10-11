'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'css/mobile.css'), 'utf8');
const components = fs.readFileSync(path.join(root, 'css/components.css'), 'utf8');
const base = fs.readFileSync(path.join(root, 'css/base.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const bridge = fs.readFileSync(path.join(root, 'js/capacitor-bridge.js'), 'utf8');
const mobile = fs.readFileSync(path.join(root, 'js/mobile-ux.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const cap = fs.readFileSync(path.join(root, 'capacitor.config.ts'), 'utf8');

const checks = [
  ['bottom-nav fixed', /\.tabs-row\.bottom-nav\s*\{[^}]*position:\s*fixed/s.test(components)],
  ['bottom-nav at bottom', /bottom:\s*0/.test(components)],
  ['4-column grid', /grid-template-columns:\s*repeat\(4/.test(components)],
  ['subnav fixed full-width', /position:\s*fixed/.test(components) && /bottom:\s*calc\(64px/.test(components)],
  ['safe-area on bottom nav', /padding-bottom:\s*env\(safe-area-inset-bottom/.test(components)],
  ['48px form controls', /input,\s*textarea,\s*select\s*\{[^}]*min-height:\s*48px/s.test(css)],
  ['16px inputs (iOS no-zoom)', /font-size:\s*16px\s*!important/s.test(css)],
  ['modal max height', /max-height:\s*calc\(100dvh - 24px\)/.test(css)],
  ['landscape guard', /Поверните телефон вертикально/.test(css)],
  ['keyboard hides bottom nav', /html\.keyboard-open \.tabs-row\.bottom-nav/.test(css)],
  ['NAV_GROUPS settings sub-tabs', app.includes('tabs: ["settings", "settings-ai"]') && !/id: "settings",[\s\S]{0,150}direct: true/.test(app)],
  ['AI settings sub-tab label', /id:"settings-ai", label:"🤖 AI"/.test(fs.readFileSync(path.join(root, 'js/runtime.js'), 'utf8'))],
  ['bottomNav markup', /bottom-nav/.test(index)],
  ['mobile UX script loaded', index.includes('js/mobile-ux.js')],
  ['visual viewport support', /visualViewport/.test(mobile)],
  ['portrait lock attempt', /orientation\.lock\(['"]portrait['"]\)/.test(bridge)],
  ['safe-area body padding', /env\(safe-area-inset-top\)/.test(base)],
  ['viewport-fit=cover', /viewport-fit=cover/.test(index)],
  ['app padding for bottom nav', /72px \+ env\(safe-area-inset-bottom/.test(base)],
];

for (const [name, ok] of checks) {
  if (!ok) throw new Error(`mobile-ux check failed: ${name}`);
}
console.log('mobile-ux: PASS');
