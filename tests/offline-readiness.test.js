"use strict";

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const WWW_INDEX = fs.readFileSync(path.join(ROOT, 'www', 'index.html'), 'utf8');

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// The application shell must not require third-party network resources to boot.
for (const [name, html] of [['index.html', INDEX], ['www/index.html', WWW_INDEX]]) {
    assert(!/fonts\.(googleapis|gstatic)\.com/i.test(html), `${name}: external font dependency remains`);
    assert(!/<script[^>]+src=["']https?:\/\//i.test(html), `${name}: external script dependency remains`);
    assert(!/<link[^>]+(?:href|src)=["']https?:\/\//i.test(html), `${name}: external link dependency remains`);
}

// All boot scripts must be local to the APK bundle.
for (const script of ['js/runtime.js', 'js/mobile-ux.js', 'js/capacitor-bridge.js']) {
    assert(fs.existsSync(path.join(ROOT, script)), `missing local boot script: ${script}`);
}

// AI is intentionally network-backed, but must fail gracefully rather than block the app.
const ai = fs.readFileSync(path.join(ROOT, 'js/ai.js'), 'utf8');
assert(ai.includes('Не удалось связаться с AI-прокси'), 'AI offline failure handling is missing');

console.log('offline-readiness: PASS');
