"use strict";

function toast(msg){
const existing = document.querySelector('.toast');
if (existing) existing.remove();
const el = document.createElement("div");
el.className = "toast";
el.textContent = msg;
document.body.appendChild(el);
setTimeout(()=> el.remove(), 2600);
}

function toastAIError(error, prefix){
if (error && error.cancelled) return;
toast((prefix || '❌ Ошибка генерации: ') + error.message);
console.error(error);
}

let achievementUnlockQueue = [];
let achievementUnlockActive = false;
let achievementUnlockSequenceBlocked = false;

function beginRewardSequence(){
    achievementUnlockSequenceBlocked = true;
}

function releaseRewardSequence(){
    achievementUnlockSequenceBlocked = false;
    if (!achievementUnlockActive) showNextAchievementUnlock();
}

function queueAchievementUnlock(data){
    achievementUnlockQueue.push(data);
    if (!achievementUnlockSequenceBlocked && !achievementUnlockActive) showNextAchievementUnlock();
}

function playAchievementSound(isMaxRank = false){
    if (typeof Sound !== 'undefined') Sound.achievement(!!isMaxRank);
}

function showNextAchievementUnlock(){
    if (achievementUnlockActive || !achievementUnlockQueue.length) return;
    achievementUnlockActive = true;
    const data = achievementUnlockQueue.shift();
    const overlay = document.createElement('div');
    overlay.className = `achievement-unlock-overlay${data.isMaxRank ? ' achievement-unlock-max' : ''}`;

    const particles = document.createElement('div');
    particles.className = 'achievement-particles';
    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('span');
        particle.style.setProperty('--particle-angle', `${Math.round((360 / 18) * i)}deg`);
        particle.style.setProperty('--particle-delay', `${(i % 6) * 0.025}s`);
        particles.appendChild(particle);
    }

    const card = document.createElement('div');
    card.className = 'achievement-unlock-card';
    const transition = data.previousRank
        ? `<div class="achievement-unlock-rank-transition"><span>${escapeHtml(data.previousRank)}</span><b>→</b><strong>${escapeHtml(data.rank)}</strong></div>`
        : `<div class="achievement-unlock-rank">РАНГ ${escapeHtml(data.rank)}</div>`;
    const footer = data.isMaxRank ? 'МАКСИМАЛЬНЫЙ РАНГ ДОСТИГНУТ' : (data.previousRank ? 'РАНГ ПОВЫШЕН' : 'НОВОЕ ДОСТИЖЕНИЕ');
    const progressText = data.currentValueText
        ? `${escapeHtml(data.currentValueText)}${data.unit ? ` ${escapeHtml(data.unit)}` : ''}`
        : 'Получено';
    const nextText = data.isMaxRank
        ? 'Достигнут максимальный X ранг'
        : data.nextThresholdText
            ? `Следующий ранг: ${escapeHtml(data.nextThresholdText)}${data.unit ? ` ${escapeHtml(data.unit)}` : ''}`
            : 'Персональное достижение';
    card.innerHTML = `
        <div class="achievement-unlock-icon-wrap"><div class="achievement-unlock-icon">${escapeHtml(data.icon || '🏆')}</div></div>
        <div class="achievement-unlock-new">
            <div class="achievement-unlock-label">НОВОЕ ДОСТИЖЕНИЕ</div>
            <div class="achievement-unlock-title">${escapeHtml(data.title || 'Новое достижение')}</div>
        </div>
        <div class="achievement-unlock-desc">${escapeHtml(data.desc || 'Достижение открыто в профиле.')}</div>
        ${transition}
        <div class="achievement-unlock-progress">
            <div class="achievement-unlock-progress-label">Прогресс</div>
            <div class="achievement-unlock-progress-value">${progressText}</div>
            <div class="achievement-unlock-next">${nextText}</div>
        </div>
        <div class="achievement-unlock-footer">${footer === 'НОВОЕ ДОСТИЖЕНИЕ' ? 'ДОСТИЖЕНИЕ ПОЛУЧЕНО' : footer}</div>
        <div class="achievement-unlock-hint">Нажмите, чтобы закрыть</div>
    `;
    overlay.appendChild(particles);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    playAchievementSound(data.isMaxRank);

    let closing = false;
    let animationDone = false;
    let hintTimer = null;
    const markAnimationDone = () => {
        if (animationDone || closing || !overlay.isConnected) return;
        animationDone = true;
        const hint = card.querySelector('.achievement-unlock-hint');
        if (hint) hint.textContent = 'Нажмите, чтобы закрыть';
    };
    // Ждём завершения самой длинной анимации (кольцо у максимального ранга: 1.35s + delay).
    // Раньше таймер был 1.05s, поэтому визуально анимация ещё шла, а логика уже считала её завершённой.
    hintTimer = setTimeout(markAnimationDone, 1650);

    const finish = () => {
        if (closing || !overlay.isConnected) return;
        if (!animationDone) {
            animationDone = true;
            overlay.classList.add('achievement-unlock-skip');
            const hint = card.querySelector('.achievement-unlock-hint');
            if (hint) hint.textContent = 'Нажмите, чтобы закрыть';
            return;
        }
        closing = true;
        if (hintTimer) clearTimeout(hintTimer);
        overlay.classList.add('achievement-unlock-closing');
        setTimeout(() => {
            if (overlay.isConnected) overlay.remove();
            achievementUnlockActive = false;
            showNextAchievementUnlock();
        }, 420);
    };
    overlay.addEventListener('click', finish);
}

let activityTrackingTimer = null;
let activityTrackingLast = null;

function formatActivityDuration(totalSeconds){
const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
if (hours > 0) return `${hours} ч ${minutes} мин`;
return `${minutes} мин`;
}

function flushActivityTime(force = false){
if (!state) return;
const now = Date.now();
if (activityTrackingLast === null) { activityTrackingLast = now; return; }
if (document.visibilityState !== 'visible' && !force) { activityTrackingLast = now; return; }
const elapsed = Math.max(0, Math.min(60, Math.floor((now - activityTrackingLast) / 1000)));
if (elapsed <= 0) return;
activityTrackingLast = now;
resetTodayStatsIfNeeded();
if (typeof CharacterCore !== 'undefined') CharacterCore.addActivitySeconds(elapsed); else return;
stateDirty = true;
renderTodayStats();
}

function startActivityTracking(){
if (activityTrackingTimer) clearInterval(activityTrackingTimer);
activityTrackingLast = Date.now();
activityTrackingTimer = setInterval(() => flushActivityTime(false), 1000);
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible') {
activityTrackingLast = Date.now();
renderTodayStats();
} else {
flushActivityTime(true);
}
});
window.addEventListener('beforeunload', () => flushActivityTime(true));
}

function showAIThinking(text){
aiCancelRequested = false;
const el = document.getElementById('aiThinkingOverlay');
const txt = document.getElementById('aiThinkingText');
const timerEl = document.getElementById('aiThinkingTimer');
if (txt) txt.textContent = text || '🤖 AI думает...';
if (timerEl) timerEl.textContent = '0 сек';
if (el) el.style.display = 'flex';
aiThinkingStartTime = Date.now();
if (aiThinkingIntervalId) clearInterval(aiThinkingIntervalId);
aiThinkingIntervalId = setInterval(() => {
if (!timerEl) return;
const sec = Math.floor((Date.now() - aiThinkingStartTime) / 1000);
timerEl.textContent = sec + ' сек';
}, 1000);
}

function hideAIThinking(){
const el = document.getElementById('aiThinkingOverlay');
if (el) el.style.display = 'none';
if (aiThinkingIntervalId) { clearInterval(aiThinkingIntervalId); aiThinkingIntervalId = null; }
}

function wireAIThinkingCancel(){
const btn = document.getElementById('aiThinkingCancelBtn');
if (!btn) return;
btn.addEventListener('click', () => {
aiCancelRequested = true;
if (aiActiveController) {
try { aiActiveController.abort(); } catch {}
}
hideAIThinking();
toast('⏹ Генерация отменена');
});
}

async function withAIThinking(text, fn){
showAIThinking(text);
try {
return await fn();
} finally {
hideAIThinking();
}
}

function showConfirm(title, message, onConfirm) {
  const existing = document.querySelector('.confirm-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
  <div class="confirm-box">
  <h3>${escapeHtml(title)}</h3>
  <p>${escapeHtml(message)}</p>
  <div class="actions">
  <button class="btn" id="confirmCancel">Отмена</button>
  <button class="btn danger" id="confirmOk">Подтвердить</button>
  </div>
  </div>
  `;
document.body.appendChild(overlay);
overlay.querySelector('#confirmCancel').addEventListener('click', () => {
overlay.remove();
});
overlay.querySelector('#confirmOk').addEventListener('click', () => {
overlay.remove();
onConfirm();
});
overlay.addEventListener('click', (e) => {
if (e.target === overlay) overlay.remove();
});
}

const NAV_GROUPS = [
  { id: "game", icon: "⚔️", label: "Игра", tabs: ["char", "quests", "boss", "journal", "ach"] },
  { id: "character", icon: "🧍", label: "Персонаж", tabs: ["profile", "skills", "perks", "gear"] },
  { id: "resources", icon: "🎒", label: "Ресурсы", tabs: ["inventory", "craft", "economy"] },
  { id: "settings", icon: "⚙️", label: "Настройки", tabs: ["settings", "settings-ai"] }
];

function groupIdForTab(tabId) {
  const g = NAV_GROUPS.find(group => group.tabs.includes(tabId));
  return g ? g.id : null;
}

function renderTabs(){
    const nav = document.getElementById("tabs");
    if (!nav) return;
    nav.innerHTML = "";

    const tabById = Object.fromEntries(TABS.map(t => [t.id, t]));

    const makeSubButton = (t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t.label;
      b.dataset.tab = t.id;
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchTab(t.id);
        closeTabMenu();
      });
      return b;
    };

    NAV_GROUPS.forEach(group => {
      const wrap = document.createElement("div");
      wrap.className = "tab-group tab-group-collapsible";
      wrap.dataset.group = group.id;
      if (group.direct) wrap.classList.add("tab-group-direct");

      const primary = document.createElement("button");
      primary.className = "tab-primary";
      primary.type = "button";
      primary.dataset.group = group.id;
      primary.setAttribute("aria-expanded", "false");
      if (group.direct) {
        primary.setAttribute("aria-label", "Настройки");
        primary.title = "Настройки";
        primary.innerHTML = `<span class="tab-primary-icon">${group.icon}</span>`;
        primary.classList.add("tab-primary-icon-only");
      } else {
        primary.innerHTML = `<span class="tab-primary-icon">${group.icon}</span><span class="tab-primary-label">${group.label}</span>`;
      }

      primary.addEventListener("click", (e) => {
        e.preventDefault();
        if (group.direct) {
          closeTabMenu();
          switchTab(group.tabs[0]);
          return;
        }

        const isOpen = wrap.classList.contains("open");
        closeTabMenu();
        if (!isOpen) {
          wrap.classList.remove("closing");
          wrap.classList.add("open");
          primary.setAttribute("aria-expanded", "true");
          document.getElementById("tabMenuBackdrop")?.classList.add("visible");
        }
      });

      wrap.appendChild(primary);

      if (!group.direct) {
        const subnav = document.createElement("div");
        subnav.className = "tab-subnav";
        subnav.setAttribute("role", "menu");
        group.tabs.forEach(id => {
          if (tabById[id]) subnav.appendChild(makeSubButton(tabById[id]));
        });
        wrap.appendChild(subnav);
      }

      nav.appendChild(wrap);
    });

    // Backdrop: tap outside closes sub-menu
    let backdrop = document.getElementById("tabMenuBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "tabMenuBackdrop";
      backdrop.className = "tab-menu-backdrop";
      backdrop.addEventListener("click", () => closeTabMenu());
      document.body.appendChild(backdrop);
    }

    // Highlight current tab if panels already active
    const activePanel = document.querySelector("section.panel.active");
    if (activePanel && activePanel.id.startsWith("panel-")) {
      switchTab(activePanel.id.slice(6));
    } else {
      switchTab("char");
    }
}

function closeTabMenu(){
  document.querySelectorAll(".tab-group-collapsible").forEach(g => {
    const p = g.querySelector(".tab-primary");
    if (p) p.setAttribute("aria-expanded", "false");
    g.classList.remove("closing");
    if (g.classList.contains("open")) {
      g.classList.remove("open");
      g.classList.add("closing");
      setTimeout(() => g.classList.remove("closing"), 160);
    }
  });
  document.getElementById("tabMenuBackdrop")?.classList.remove("visible");
}

function switchTab(id){
  if (typeof Sound !== 'undefined') Sound.tab();
  document.querySelectorAll(".tab-subnav button").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === id);
  });
  const targetId = "panel-" + id;
  document.querySelectorAll("section.panel").forEach(p => {
    const on = p.id === targetId;
    if (on) {
      if (!p.classList.contains("active")) {
        p.classList.add("active");
        p.classList.remove("panel-enter");
        void p.offsetWidth;
        p.classList.add("panel-enter");
      } else {
        p.classList.add("active");
      }
    } else {
      p.classList.remove("active", "panel-enter");
    }
  });

  const groupId = groupIdForTab(id);
  document.querySelectorAll(".tab-group-collapsible").forEach(g => {
    g.classList.toggle("active-group", g.dataset.group === groupId);
  });

  // Show backdrop only while a sub-menu is open
  const open = document.querySelector(".tab-group-collapsible.open");
  document.getElementById("tabMenuBackdrop")?.classList.toggle("visible", !!open);

  try {
    const panel = document.getElementById("panel-" + id);
    if (panel) panel.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  } catch (_) {}
}

function updateDateTime() {
const now = new Date();
const options = {
day: '2-digit', month: '2-digit', year: 'numeric',
hour: '2-digit', minute: '2-digit', second: '2-digit'
};
const el = document.getElementById('datetimeDisplay');
if (el) el.textContent = '🕐 ' + now.toLocaleString('ru-RU', options);
}

function scheduleRaidNotification() {
  if (typeof Notifications === 'undefined') return;
  if (!state.raidActive || !state.raidStartTime) return;
  const totalMs = Math.max(0, Number(state.raidTotalMinutes || 0) * 60000);
  if (totalMs <= 0) return;
  const endAt = Number(state.raidStartTime) + totalMs;
  const raid = (state.quests.active || []).find(q => q && q.type === 'рейд');
  const title = raid ? raid.title : '';
  Notifications.scheduleRaidEnd(title, endAt).catch(() => {});
}

function clearRaidNotification() {
  if (typeof Notifications === 'undefined') return;
  Notifications.cancelRaid().catch(() => {});
}

function startRaidTimer() {
if (raidTimerInterval) {
clearInterval(raidTimerInterval);
raidTimerInterval = null;
}
if (state.raidActive && state.raidStartTime) {
raidTimerInterval = setInterval(() => {
updateRaidTimer();
}, 1000);
updateRaidTimer();
scheduleRaidNotification();
} else {
const el = document.getElementById('raidTimer');
if (el) el.textContent = '';
clearRaidNotification();
}
}

function updateRaidTimer() {
const el = document.getElementById('raidTimer');
if (!el) return;
if (!state.raidActive || !state.raidStartTime) {
el.textContent = '';
return;
}
const elapsedMs = Date.now() - state.raidStartTime;
const totalMs = Math.max(0, Number(state.raidTotalMinutes || 0) * 60000);
if (totalMs > 0 && elapsedMs >= totalMs) {
  // Time is up — do NOT auto-fail. Player must confirm success or failure.
  el.textContent = '⏰ ВРЕМЯ ВЫШЛО — подтверди результат';
  el.classList.add('raid-timer-expired');
  if (!state._raidExpiredNotified) {
    state._raidExpiredNotified = true;
    clearRaidNotification();
    // Re-render once so action buttons switch to Выполнить / Провалить
    try { if (typeof renderQuests === 'function') renderQuests(); } catch (_) {}
    if (typeof Sound !== 'undefined') Sound.raidWarn();
    toast('⏰ Время рейда истекло. Подтверди: Выполнить или Провалить');
  }
  return;
}
el.classList.remove('raid-timer-expired');
state._raidExpiredNotified = false;
const remainingMs = Math.max(0, totalMs - elapsedMs);
const totalSeconds = Math.ceil(remainingMs / 1000);
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;
let msg = `⏳ Осталось ${hours}ч ${String(minutes).padStart(2,'0')}м ${String(seconds).padStart(2,'0')}с`;
if (totalMs > 0) {
  const pct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  msg += ` · ${pct}%`;
}
el.textContent = msg;
}

function renderHeader(){
    const elName = document.getElementById("charName");
    const elLevel = document.getElementById("charLevel");
    const elXpBar = document.getElementById("xpBar");
    const elXpText = document.getElementById("xpText");
    const elCoins = document.getElementById("coinsTop");
    const elSpecialPoints = document.getElementById("specialPointsTop");
    const elHeaderPower = document.getElementById("headerPowerValue");
    if (elName) elName.textContent = state.character.name;
    if (elLevel) elLevel.textContent = "УРОВЕНЬ " + state.character.level;
    const threshold = levelThreshold(state.character.level);
    const pct = Math.min(100, (state.character.heroXP/threshold*100));
    if (elXpBar) elXpBar.style.width = pct + "%";
    if (elXpText) elXpText.textContent = `${state.character.heroXP}/${threshold}`;
    if (elCoins) elCoins.textContent = fmt(state.character.coins);
    if (elSpecialPoints) elSpecialPoints.textContent = state.character.specialPoints;
    if (elHeaderPower) animatePowerValue(elHeaderPower, getProfilePower());
    if (pendingLevelUpEffect) {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.remove('level-up-pulse');
            void header.offsetWidth;
            header.classList.add('level-up-pulse');
            setTimeout(() => header.classList.remove('level-up-pulse'), 700);
        }
        pendingLevelUpEffect = false;
    }
    updateDateTime();
    updateActiveBuffsHeader();
}

function renderTodayStats(){
resetTodayStatsIfNeeded();
const elQuests = document.getElementById("todayQuests");
const elCoins = document.getElementById("todayCoins");
const elXP = document.getElementById("todayXP");
const elActivity = document.getElementById("todayActivity");
if (elQuests) elQuests.textContent = state.todayStats.quests;
if (elCoins) elCoins.textContent = state.todayStats.coins;
if (elXP) elXP.textContent = state.todayStats.xp;
if (elActivity) elActivity.textContent = formatActivityDuration(state.todayStats.activitySeconds);
}

function dashQuestHtml(q, showProgress){
    const dm = diffMeta(q.difficulty);
    let timeHtml = '';
    if (q.estMinutes) {
        const hours = Math.floor(q.estMinutes / 60);
        const minutes = q.estMinutes % 60;
        timeHtml = `<span class="pill time">⏱ ${hours}ч ${minutes}м</span>`;
    }
    let progressHtml = '';
    if (q.total && q.total > 1 && showProgress) {
        progressHtml = `<span class="pill steps">🔢 ${q.progress||0}/${q.total}</span>`;
    } else if (q.total && q.total > 1) {
        progressHtml = `<span class="pill steps">🔢 ${q.total} этап.</span>`;
    }
    const diffKey = safeDifficulty(q.difficulty);
    return `
    <div class="quest diff-${diffKey}">
        <div class="qh"><span class="title">${escapeHtml(q.icon||'')} ${escapeHtml(q.title)}</span></div>
        <div class="pill-row">
            <span class="pill diff-${diffKey}">${dm.label}</span>
            ${timeHtml}
            ${progressHtml}
            ${q.reward && q.reward.heroXP ? `<span class="pill reward-hero">⭐ +${q.reward.heroXP} XP</span>` : ''}
            ${q.reward && q.reward.coins ? `<span class="pill reward-coin">🪙 +${q.reward.coins}</span>` : ''}
        </div>
    </div>
    `;
}

function renderDashboard(){
const bossWrap = document.getElementById('dashBoss');
if (bossWrap){
const boss = getActiveBoss();
if (!boss){
bossWrap.innerHTML = `<div class="empty">Нет активного босса</div>`;
} else {
const isFinancial = boss.bossType !== 'other';
const unit = boss.unit || (isFinancial ? '₽' : 'ед.');
const totalProgress = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const remaining = Math.max(0, boss.target - totalProgress);
const barPct = Math.min(100, isFinancial ? (remaining / boss.target * 100) : (totalProgress / boss.target * 100));
const barGradient = isFinancial ? 'linear-gradient(90deg,var(--red),#ff8a3d)' : 'linear-gradient(90deg,#ff8a3d,var(--gold))';
bossWrap.innerHTML = `
<div style="color:var(--phosphor-bright); font-weight:700; font-size:13px;">${escapeHtml(boss.name)}</div>
<div class="sub">${escapeHtml(boss.goal)}</div>
<div class="xp-row" style="margin-top:6px;">
<div class="bar boss-bar"><span style="width:${barPct}%; background:${barGradient};"></span></div>
<span>${barPct.toFixed(1)}%</span>
</div>
<div class="sub" style="margin-top:2px;">${isFinancial ? `HP босса: ${fmt(remaining)} / ${fmt(boss.target)} ${unit}` : `Прогресс: ${fmt(totalProgress)} / ${fmt(boss.target)} ${unit}`}</div>
`;
}
}
const raidWrap = document.getElementById('dashRaid');
if (raidWrap){
const raid = state.quests.active.find(q => q.type === 'рейд');
raidWrap.innerHTML = raid ? dashQuestHtml(raid, true) : `<div class="empty">Нет активного рейда</div>`;
}
const plannedWrap = document.getElementById('dashPlanned');
if (plannedWrap){
plannedWrap.innerHTML = state.quests.planned.length
? state.quests.planned.map(q => dashQuestHtml(q, false)).join('')
: `<div class="empty">Нет запланированного квеста</div>`;
}
const activeWrap = document.getElementById('dashActive');
if (activeWrap){
const activeQuests = state.quests.active.filter(q => q.type !== 'рейд');
activeWrap.innerHTML = activeQuests.length
? activeQuests.map(q => dashQuestHtml(q, true)).join('')
: `<div class="empty">Нет активного квеста</div>`;
}
}

function escapeHtml(value){
const str=String(value??'');
return str.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function showFirstLaunchNicknameForm(){
  const overlay = document.getElementById('firstLaunchOverlay');
  const input = document.getElementById('firstLaunchNickname');
  const error = document.getElementById('firstLaunchError');
  const button = document.getElementById('firstLaunchStartBtn');
  if (!overlay || !input || !button) return;

  overlay.style.display = 'flex';
  document.body.classList.add('first-launch-open');
  input.value = '';
  if (error) error.textContent = '';

  const submit = () => {
    const nickname = input.value.trim();
    if (!nickname) {
      if (error) error.textContent = 'Введите никнейм.';
      input.focus();
      return;
    }

    if (nickname.length > 24) {
      if (error) error.textContent = 'Никнейм должен содержать не более 24 символов.';
      input.focus();
      return;
    }

    const nameResult = typeof CharacterCore !== 'undefined' ? CharacterCore.setName(nickname) : {ok:false};
    if (!nameResult.ok) {
      if (error) error.textContent = 'Не удалось изменить имя профиля.';
      return;
    }
    if (!SaveService.save()) {
      if (error) error.textContent = 'Не удалось сохранить профиль. Попробуйте ещё раз.';
      return;
    }

    overlay.style.display = 'none';
    document.body.classList.remove('first-launch-open');
    renderHeader();
    renderProfile();
    toast(`Добро пожаловать, ${nickname}!`);
  };

  button.onclick = submit;
  input.onkeydown = (event) => {
    if (event.key === 'Enter') submit();
  };

  setTimeout(() => input.focus(), 50);
}

// ===== Skills UI (must be before renderAll/init) =====
const SPECIAL_ORDER = [
    { letter: 'S', key: '💪 Сила' },
    { letter: 'P', key: '👁️ Восприятие' },
    { letter: 'E', key: '🛡️ Выносливость' },
    { letter: 'C', key: '🗣️ Харизма' },
    { letter: 'I', key: '🧠 Интеллект' },
    { letter: 'A', key: '⚡ Ловкость' },
    { letter: 'L', key: '🎲 Удача' },
];

function renderSpecial(){
    const grid = document.getElementById("specialGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const canSpend = state.character.specialPoints > 0;
    SPECIAL_ORDER.forEach(({letter, key})=>{
        if (!(key in state.special)) return;
        const v = state.special[key];
        const div = document.createElement("div");
        div.className = "special-cell";
        div.innerHTML = `<span class="sp-name"><b class="sp-letter">${letter}</b> — ${key}</span><b class="sp-value">${v}</b><button class="btn primary sp-plus" data-special="${key}" style="font-size:10px;" ${canSpend ? '' : 'disabled'}>+1</button>`;
        grid.appendChild(div);
    });
    grid.querySelectorAll('.sp-plus').forEach(btn => btn.addEventListener('click', () => {
        const key = btn.dataset.special;
        if (state.character.specialPoints <= 0) return;
        const result = typeof CharacterCore !== 'undefined' ? CharacterCore.spendSpecialPoint(key) : {ok:false};
        if (!result.ok) return;
        persist(); renderAll();
        const newBlock = Array.from(document.querySelectorAll('.special-cell')).find(cell =>
            cell.querySelector('.sp-plus')?.dataset.special === key
        );
        spawnBoostEffect(newBlock);
        toast(`${key} повышена до ${result.value}`);
    }));
}

function renderSkills(){
    const list = document.getElementById("skillsList");
    if (!list) return;
    list.innerHTML = "";

    const groups = [
        { letter: 'S', key: '💪 Сила' },
        { letter: 'P', key: '👁️ Восприятие' },
        { letter: 'E', key: '🛡️ Выносливость' },
        { letter: 'C', key: '🗣️ Харизма' },
        { letter: 'I', key: '🧠 Интеллект' },
        { letter: 'A', key: '⚡ Ловкость' },
        { letter: 'L', key: '🎲 Удача' },
    ];

    const skillsByName = new Map(SKILLS_DATA.map(skill => [skill.name, skill]));
    const rendered = new Set();

    const renderSkillRow = (skill) => {
        const name = skill.name;
        const xp = Number(state.skills[name]) || 0;
        const level = getSkillLevel(xp);
        const specialKey = getSkillSpecial(name);
        const multiplier = getSkillMultiplier(name);
        const nextThreshold = skillLevelThreshold(level + 1);
        const currentThreshold = skillLevelFloor(level);
        const xpInLevel = Math.max(0, xp - currentThreshold);
        const xpNeeded = Math.max(1, nextThreshold - currentThreshold);
        const pct = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

        rendered.add(name);

        return `
            <div class="skill-row skill-group-row">
                <div class="label skill-row-head">
                    <span class="skill-row-title">
                        <span class="skill-name">${escapeHtml(name)}</span>
                        <span class="skill-total-xp">${fmt(xp)} XP</span>
                    </span>
                    <b class="skill-level-right">УРОВЕНЬ ${level}</b>
                </div>
                <div class="bar"><span style="width:${pct}%"></span></div>
                <div class="skill-row-meta">
                    <span>${fmt(xpInLevel)} / ${fmt(xpNeeded)} XP до уровня ${level + 1}</span>
                    <span>${specialKey ? `${escapeHtml(formatSkillMultiplier(multiplier))} XP` : ''}</span>
                </div>
            </div>
        `;
    };

    groups.forEach(({letter, key}) => {
        const skills = SPECIAL_SKILL_LINKS[key] || [];
        const block = document.createElement('div');
        block.className = 'skill-special-block';
        block.innerHTML = `
            <div class="skill-special-header">
                <span class="skill-special-letter">${letter}</span>
                <span class="skill-special-name">${escapeHtml(key)}</span>
            </div>
            <div class="skill-special-list">
                ${skills.map(name => {
                    const skill = skillsByName.get(name) || {name, desc:''};
                    return renderSkillRow(skill);
                }).join('')}
            </div>
        `;
        list.appendChild(block);
    });

    // Если в данных появится новый навык, не привязанный к SPECIAL,
    // не теряем его из интерфейса.
    const ungrouped = SKILLS_DATA.filter(skill => !rendered.has(skill.name));
    if (ungrouped.length) {
        const block = document.createElement('div');
        block.className = 'skill-special-block skill-special-block-ungrouped';
        block.innerHTML = `
            <div class="skill-special-header">
                <span class="skill-special-letter">•</span>
                <span class="skill-special-name">ПРОЧИЕ НАВЫКИ</span>
            </div>
            <div class="skill-special-list">${ungrouped.map(renderSkillRow).join('')}</div>
        `;
        list.appendChild(block);
    }
}

function renderAll(){
renderHeader();
renderTodayStats();
renderDashboard();
renderSpecial();
renderPerks();
renderSkills();
renderQuests();
renderBosses();
renderEconomy();
renderSlots();
renderAccessorySlots();
renderInventory();
renderCraft();
renderAchievements();
renderProfile();
renderJournal();
renderSettings();
updateAIStatus();
}

function hasInitializedProfile(){
  return !!(state && state.character && typeof state.character.name === 'string' && state.character.name.trim());
}

async function init(){
  // Show CRT boot + logo before wiring the rest
  let bootPromise = Promise.resolve();
  if (typeof BootSplash !== 'undefined') {
    bootPromise = BootSplash.run();
  }
const hasSavedGame = await SaveService.loadAsync();
if (!hasSavedGame) {
  GameState.replace(defaultState());
}
const profileInitialized = hasInitializedProfile();
applyTheme(state.settings.theme || 'nature');

// Сначала запускаем сам интерфейс. AI не должен блокировать вкладки и кнопки.
try { renderTabs(); } catch (e) { console.error('renderTabs failed:', e); }
try { renderAll(); } catch (e) { console.error('renderAll failed:', e); toast('⚠️ Ошибка отрисовки интерфейса: ' + e.message); }
if (!profileInitialized) showFirstLaunchNicknameForm();
startActivityTracking();

// Проверка AI — полностью неблокирующая, не задерживает интерфейс.
checkAIAvailability().catch(e => console.error('AI check failed:', e));

const wireSteps = [
  ['wireNewQuestForm', wireNewQuestForm],
  ['wireBossCreation', wireBossCreation],
  ['wireShopCreation', wireShopCreation],
  ['wireShopAI', wireShopAI],
  ['wireInventoryFilters', wireInventoryFilters],
  ['wireGearCreation', wireGearCreation],
  ['wireAIPerkGeneration', wireAIPerkGeneration],
  ['wireCraft', wireCraft],
  ['wireJournal', wireJournal],
  ['wireSettings', wireSettings],
  ['wireExportImport', wireExportImport],
  ['wireSaveIndicator', wireSaveIndicator],
  ['wireAI', wireAI],
  ['wireAIThinkingCancel', wireAIThinkingCancel]
];
wireSteps.forEach(([name, fn]) => {
  try { fn(); } catch (e) { console.error(name + ' failed:', e); }
});
setInterval(updateDateTime, 1000);
setInterval(updateActiveBuffsHeader, 1000);
setInterval(() => {
autosaveNextAt = Date.now() + AUTOSAVE_INTERVAL;
if (stateDirty) SaveService.save();
}, AUTOSAVE_INTERVAL);
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'hidden') {
flushActivityTime(true);
flushPendingSave(false);
} else {
updateActiveBuffsHeader();
}
});
window.addEventListener('beforeunload', () => {
flushActivityTime(true);
flushPendingSave(false);
});
if (state.raidActive) {
startRaidTimer();
}
if (typeof Sound !== 'undefined' && Sound.installUnlockListeners) Sound.installUnlockListeners();
if (typeof Notifications !== 'undefined' && Notifications.init) {
  try { Notifications.init(); } catch (e) { console.warn('Notifications.init failed', e); }
}
if (state.raidActive) scheduleRaidNotification();
console.log('🧬 The Creed of Life v3.7.4 (Fast terminal boot) + AI loaded');
console.log(`📊 Level ${state.character.level}, ${state.quests.active.length} active quests`);
console.log(`👹 ${state.bosses.length} bosses`);
console.log(`🤖 AI: ${aiAvailable ? 'online' : 'offline'}`);
  try {
    if (typeof BootSplash !== 'undefined') BootSplash.done();
    await bootPromise;
  } catch (_) {}
}

// Запускаем приложение после загрузки DOM.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
