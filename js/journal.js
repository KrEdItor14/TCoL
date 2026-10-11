"use strict";

const JOURNAL_MAX = JournalCore.MAX;
const JOURNAL_MAX_AGE_DAYS = JournalCore.MAX_AGE_DAYS;

function pruneJournal() {
  return JournalCore.prune();
}

let journalTypeFilter = 'all';
let journalDateFilter = 'all';

const JOURNAL_TYPES = [
  { id: 'all', label: 'Все' },
  { id: 'quest', label: '⚔️ Квесты' },
  { id: 'progress', label: '⬆️ Прогресс' },
  { id: 'reward', label: '🎁 Награды' },
  { id: 'boss', label: '👹 Боссы' },
  { id: 'item', label: '🎒 Предметы' },
];

const JOURNAL_TYPE_GROUPS = {
  quest: ['quest'],
  progress: ['level', 'xp', 'skill', 'perk'],
  reward: ['coins', 'achievement'],
  boss: ['boss'],
  item: ['item', 'craft'],
};

function journalEventMatchesType(ev) {
  if (journalTypeFilter === 'all') return true;
  const allowed = JOURNAL_TYPE_GROUPS[journalTypeFilter];
  return allowed ? allowed.includes(ev.type) : false;
}

function journalEventMatchesDate(ev) {
  const now = Date.now();
  if (journalDateFilter === 'today') {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return ev.ts >= d.getTime();
  }
  if (journalDateFilter === 'week')  return ev.ts >= now - 7  * 86400000;
  if (journalDateFilter === 'month') return ev.ts >= now - 30 * 86400000;
  return true;
}

function formatJournalDate(ts) {
  const d = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (d >= today) return `📅 Сегодня · ${dd}.${mm}.${yyyy}`;
  if (d >= yesterday) return `📅 Вчера · ${dd}.${mm}.${yyyy}`;
  return `📅 ${dd}.${mm}.${yyyy}`;
}

function formatJournalTime(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function renderJournal() {
  const list = document.getElementById('journalList');
  if (!list) return;

  pruneJournal();

  const typeWrap = document.getElementById('journalTypeFilters');
  if (typeWrap) {
    typeWrap.innerHTML = JOURNAL_TYPES.map(t =>
      `<button class="btn ${journalTypeFilter === t.id ? 'active' : ''}" data-jtype="${t.id}">${t.label}</button>`
    ).join('');
    typeWrap.querySelectorAll('[data-jtype]').forEach(btn => {
      btn.addEventListener('click', () => {
        journalTypeFilter = btn.dataset.jtype;
        renderJournal();
      });
    });
  }

  const dateWrap = document.getElementById('journalDateFilters');
  if (dateWrap) {
    const opts = [
      { id: 'all',   label: 'Всё время' },
      { id: 'today', label: 'Сегодня' },
      { id: 'week',  label: '7 дней' },
      { id: 'month', label: '30 дней' },
    ];
    dateWrap.innerHTML = opts.map(o =>
      `<button class="btn ${journalDateFilter === o.id ? 'active' : ''}" data-jdate="${o.id}">${o.label}</button>`
    ).join('');
    dateWrap.querySelectorAll('[data-jdate]').forEach(btn => {
      btn.addEventListener('click', () => {
        journalDateFilter = btn.dataset.jdate;
        renderJournal();
      });
    });
  }

  const events = (state.journal || []).filter(ev =>
    journalEventMatchesType(ev) && journalEventMatchesDate(ev)
  );

  if (!events.length) {
    list.innerHTML = `<div class="empty">Событий пока нет.</div>`;
    return;
  }

  const groups = new Map();
  events.forEach(ev => {
    const d = new Date(ev.ts); d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ev);
  });

  list.innerHTML = Array.from(groups.entries()).map(([dayTs, evs]) => {
    const rows = evs.map(ev => `
      <div class="journal-event journal-type-${ev.type}">
        <span class="journal-event-icon">${escapeHtml(ev.icon)}</span>
        <span class="journal-event-text">${escapeHtml(ev.text)}</span>
        <span class="journal-event-time">${formatJournalTime(ev.ts)}</span>
      </div>
    `).join('');
    return `<div class="journal-day">
      <div class="journal-day-head">${formatJournalDate(dayTs)}</div>
      ${rows}
    </div>`;
  }).join('');
}

function clearJournal() {
  showConfirm(
    '🗑 Очистить журнал',
    'Удалить всю историю событий? Действие необратимо.',
    () => {
      JournalCore.clear();
      persist(); renderJournal();
      toast('Журнал очищен');
    }
  );
}

function wireJournal() {
  const clearBtn = document.getElementById('journalClearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearJournal);
}