"use strict";


/*
 * Journal Core
 * Игровая логика журнала событий не зависит от DOM и UI.
 */
const JournalCore = (() => {
  const MAX = 500;
  const MAX_AGE_DAYS = 60;

  function ensure() {
    if (!Array.isArray(S().journal)) S().journal = [];
    return S().journal;
  }

  function logEvent(type, icon, text, meta) {
    const journal = ensure();
    const event = {
      id: 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      type: type || 'other',
      ts: Date.now(),
      icon: icon || '•',
      text: text || '',
      meta: meta || null
    };
    journal.unshift(event);
    if (journal.length > MAX) journal.length = MAX;
    return event;
  }

  function prune(now = Date.now()) {
    const journal = ensure();
    const cutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const before = journal.length;
    S().journal = journal.filter(ev => ev && ev.ts > cutoff);
    if (S().journal.length > MAX) S().journal.length = MAX;
    return before !== S().journal.length;
  }

  function clear() {
    S().journal = [];
    return true;
  }

  return {
    MAX,
    MAX_AGE_DAYS,
    logEvent,
    prune,
    clear
  };
})();

function logEvent(type, icon, text, meta) {
  return JournalCore.logEvent(type, icon, text, meta);
}
