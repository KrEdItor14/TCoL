const fs = require('fs');
const vm = require('vm');

(async () => {

const source = fs.readFileSync('js/capacitor-bridge.js', 'utf8');
const listeners = new Map();
let dispatched = [];
let exitCalls = 0;

const document = {
  getElementById() { return null; },
  querySelector(selector) {
    if (selector === 'section.panel.active') return { id: 'panel-quests' };
    return null;
  },
  addEventListener(name, fn) { listeners.set(name, fn); },
  dispatchEvent(event) { dispatched.push(event.type); }

};

const App = {
  addListener(name, fn) { listeners.set(name, fn); return { remove() {} }; },
  exitApp() { exitCalls += 1; return Promise.resolve(); }
};

const StatusBar = {
  setOverlaysWebView() { return Promise.resolve(); },
  setBackgroundColor() { return Promise.resolve(); },
  setStyle() { return Promise.resolve(); }
};
const SplashScreen = { hide() { return Promise.resolve(); } };

const context = {
  window: { Capacitor: { Plugins: { App, StatusBar, SplashScreen } }, setTimeout },
  document,
  console,
  setTimeout,
  CustomEvent: function CustomEvent(type) { this.type = type; }
};

vm.createContext(context);
vm.runInContext(source, context);

if (!listeners.has('backButton')) throw new Error('backButton listener missing');
listeners.get('backButton')();
if (!dispatched.includes('tcol:native-back')) throw new Error('backButton did not dispatch native-back');
if (exitCalls !== 0) throw new Error('non-root back unexpectedly exited the app');

// On the main screen, a second Back exits the app after the bridge back lock clears.
document.querySelector = function(selector) {
  if (selector === 'section.panel.active') return { id: 'panel-char' };
  return null;
};
await new Promise(resolve => setTimeout(resolve, 300));
listeners.get('backButton')();
if (exitCalls !== 1) throw new Error('root back did not exit the app');

console.log('capacitor-bridge: PASS');
})();
