"use strict";

// UI-only formatting helper. Kept here instead of QuestCore because it is presentation logic.
function formatDebuffDuration(expiresAt){
  const ms = Math.max(0, Number(expiresAt||0) - Date.now());
  const h = Math.floor(ms / 3600000);
  const m = Math.ceil((ms % 3600000) / 60000);
  return h ? `${h}ч ${m}м` : `${m}м`;
}

function fmtMinutes(m){
  if(!m) return "";
  if(m < 60) return m + " мин";
  const h = Math.floor(m/60), mm = m % 60;
  return mm ? `${h}ч ${mm}м` : `${h}ч`;
}

function rewardGroups(reward){
  reward = reward || {};
  const xp = Number(reward.heroXP) || 0;
  const coins = Number(reward.coins) || 0;
  const skills = Object.entries(reward.skills || {}).filter(([,v]) => Number(v) || 0);
  const items = (reward.items || []).filter(it => it && it.name);
  return {xp, coins, skills, items};
}

function rewardPills(reward){
  const r = rewardGroups(reward);
  let html = '<div class="quest-rewards">';
  html += '<div class="quest-section-title">Награды:</div>';
  const main = [];
  if(r.xp) main.push(`<span class="pill reward-hero">⭐ +${r.xp} XP</span>`);
  if(r.coins) main.push(`<span class="pill reward-coin">🪙 +${r.coins}</span>`);
  if(main.length) html += `<div class="pill-row quest-reward-pill-row">${main.join('')}</div>`;
  if(r.skills.length){
    html += '<div class="quest-reward-label">Навыки:</div><div class="quest-reward-list">';
    r.skills.forEach(([k,v]) => { html += `<div>${escapeHtml(k)} - +${Number(v)||0} XP</div>`; });
    html += '</div>';
  }
  if(r.items.length){
    html += '<div class="quest-reward-label">Предметы:</div><div class="quest-reward-list">';
    r.items.forEach(item => {
      const qty = Number(item.quantity || item.count || 1) || 1;
      html += `<div>🎁 ${escapeHtml(item.name)}${qty > 1 ? ` ×${qty}` : ''}</div>`;
    });
    html += '</div>';
  }
  if(!r.xp && !r.coins && !r.skills.length && !r.items.length) html += '<div class="muted">Нет наград</div>';
  html += '</div>';
  return html;
}

function questMetaRow(q){
  const dm = diffMeta(q.difficulty);
  const diffKey = safeDifficulty(q.difficulty);
  let timeHtml = '';
  if (q.estMinutes) {
    const hours = Math.floor(q.estMinutes / 60);
    const minutes = q.estMinutes % 60;
    const time = hours ? (minutes ? `${hours}ч ${minutes}м` : `${hours}ч`) : `${minutes}м`;
    timeHtml = `<span class="pill time">⏱ ${time}</span>`;
  }
  let progressHtml = '';
  if (q.total && q.total > 1) progressHtml = `<span class="pill steps">🔢 ${q.total} этап.</span>`;
  return `<div class="pill-row quest-meta-pills"><span class="pill diff-${diffKey}">${dm.label}</span>${timeHtml}${progressHtml}</div>`;
}

function questStageProgress(q, lockedByOtherRaid=false, renderIndex=-1){
  const total = Math.max(1, Number(q.total) || 1);
  const progress = Math.min(total, Math.max(0, Number(q.progress) || 0));
  const pct = Math.min(100, progress / total * 100);
  const points = Array.from({length: total}, (_, i) => `<span class="quest-stage-point ${i < progress ? 'done' : ''}"><i></i></span>`).join('');
  return `<div class="quest-progress-block"><div class="quest-progress-head"><span>Прогресс этапов</span><span>${progress}/${total}</span></div><div class="quest-stage-points">${points}</div><div class="quest-progress-row"><div class="quest-stage-bar"><span style="width:${pct}%"></span></div><div class="quest-progress-action"><button class="btn" data-step="${renderIndex}" ${lockedByOtherRaid || progress >= total ? 'disabled':''}>+1 шаг</button></div></div></div>`;
}

function questBadgeRow(q){ return questMetaRow(q); }

function showRaidStartConfirm(raid, onConfirm) {
const existing = document.querySelector('.raid-confirm-overlay');
if (existing) existing.remove();
const overlay = document.createElement('div');
overlay.className = 'raid-confirm-overlay';
overlay.innerHTML = `
<div class="raid-confirm-card">
<div class="raid-confirm-icon">⚔️</div>
<div class="raid-confirm-title">НАЧАЛО РЕЙДА</div>
<div class="raid-confirm-subtitle">ПОДТВЕРЖДЕНИЕ ОПЕРАЦИИ</div>
<div class="raid-confirm-line"></div>
<div class="raid-confirm-name">${escapeHtml(raid.title)}</div>
<div class="raid-confirm-text">После начала рейд станет активным и запустится его таймер. Выполнение обычных квестов будет ограничено до завершения рейда.</div>
<div class="raid-confirm-warning">⚠️ Убедись, что готов начать рейд.</div>
<div class="actions raid-confirm-actions">
<button class="btn" id="raidConfirmCancel">Отмена</button>
<button class="btn danger" id="raidConfirmOk">⚔️ Начать рейд</button>
</div>
</div>`;
document.body.appendChild(overlay);
const close = () => overlay.remove();
overlay.querySelector('#raidConfirmCancel').addEventListener('click', close);
overlay.querySelector('#raidConfirmOk').addEventListener('click', () => { close(); onConfirm(); });
overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function renderQuests(){
const raidNotice = document.getElementById("raidNotice");
const planned = document.getElementById("questsPlanned");
const active = document.getElementById("questsActive");
const done = document.getElementById("questsDone");
if (raidNotice) {
raidNotice.textContent = state.raidActive
? "⚠️ Активен рабочий рейд — прочие активные квесты нельзя завершать, магазин только для просмотра."
: "Рейдов не активно.";
}
// Planned
if (planned) {
planned.innerHTML = "";
// Planned list is raids-only; drop any legacy non-raid entries from display index mapping
const plannedRaids = (state.quests.planned || []).map((q, idx) => ({ q, idx })).filter(x => x.q && x.q.type === "рейд");
const countEl = document.getElementById("countPlanned");
if (countEl) countEl.textContent = plannedRaids.length;
if(!plannedRaids.length) {
planned.innerHTML = `<div class="empty">Нет запланированных рейдов</div>`;
} else {
plannedRaids.forEach(({ q, idx })=>{
const div = document.createElement("div");
div.className = "quest quest-raid diff-" + (q.difficulty||"normal");
div.innerHTML = `
<div class="qh"><span class="title">${q.icon || "👹"} ${escapeHtml(q.title)} <span class="badge badge-raid">РЕЙД</span>${q.source === "ai" ? ' <span class="badge ai">AI</span>' : ""}</span><span class="qid">#${String(q.id).padStart(3,"0")}</span></div>
${questMetaRow(q)}
<div class="quest-desc"><div class="quest-section-title">Описание:</div><div class="quest-desc-text">${escapeHtml(q.desc)}</div></div>
${rewardPills(q.reward)}
<div class="actions"><button class="btn danger" data-idx="${idx}">⚔️ Начать рейд</button></div>
`;
div.querySelector("button").addEventListener("click", async ()=>{
const item = state.quests.planned[idx];
if (!item || item.type !== "рейд") { toast("В запланированных могут быть только рейды"); return; }
showRaidStartConfirm(item, () => {
const startedItem = QuestCore.startPlannedQuest(idx);
if (startedItem?.blocked) {
  toast(startedItem.reason === 'raid-active' ? '⚠️ Уже идёт рейд' : '⚠️ Рейд не может длиться больше 24 часов');
  return;
}
if (startedItem) {
  startRaidTimer();
  if (typeof Sound !== 'undefined') Sound.raidStart();
  persist(); renderAll();
  toast(`⚔️ Рейд начат: ${startedItem.title}`);
}
});
});
planned.appendChild(div);
});
}
}
// Active
if (active) {
active.innerHTML = "";
const countEl = document.getElementById("countActive");
if (countEl) countEl.textContent = state.quests.active.length;
if(!state.quests.active.length) {
active.innerHTML = `<div class="empty">Нет активных квестов</div>`;
} else {
state.quests.active.forEach((q, idx)=>{
const div = document.createElement("div");
const isRaid = q.type === "рейд";
const lockedByOtherRaid = state.raidActive && !isRaid;
const raidExpired = isRaid && typeof QuestCore !== "undefined" && typeof QuestCore.isRaidTimeExpired === "function" && QuestCore.isRaidTimeExpired(q);
const progressHtml = questStageProgress(q, lockedByOtherRaid, idx);
const bonusNote = q.bonus ? q.bonus.desc : (q.bonusPerExtra ? q.bonusPerExtra.desc : "");
let actionsHtml;
if (isRaid) {
  if (raidExpired) {
    actionsHtml = `
<div class="actions raid-expired-actions">
<button class="btn primary" data-complete="${idx}">Выполнить</button>
<button class="btn danger" data-fail-raid="${idx}">Провалить</button>
</div>
<div class="bonus-note raid-expired-note">⏰ Время вышло. «Выполнить» — с наградой, «Провалить» — без награды (без дебаффа отмены).</div>`;
  } else {
    // Active raid cannot be completed early — only cancel (debuff) or wait for timer.
    actionsHtml = `
<div class="actions">
<button class="btn danger" data-abort="${idx}">Отменить рейд</button>
</div>
<div class="bonus-note">⏳ Рейд идёт. Завершить можно только после истечения таймера.</div>`;
  }
} else {
  actionsHtml = `
<div class="actions">
<button class="btn primary" data-complete="${idx}" ${lockedByOtherRaid ? "disabled":""}>Завершить</button>
${q.bonus ? `<button class="btn gold" data-bonus="${idx}" ${lockedByOtherRaid ? "disabled":""}>Завершить с бонусом</button>` : ""}
<button class="btn danger" data-abort="${idx}">Отменить</button>
</div>`;
}
div.className = "quest" + (isRaid ? " quest-raid" : "") + " diff-" + (q.difficulty||"normal");
div.innerHTML = `
<div class="qh"><span class="title">${q.icon} ${escapeHtml(q.title)}${isRaid ? ' <span class="badge badge-raid">РЕЙД</span>' : ""}${q.source === "ai" ? ' <span class="badge ai">AI</span>' : ""}${raidExpired ? ' <span class="badge" style="border-color:var(--red);color:var(--red)">время вышло</span>' : ""}</span><span class="qid">#${String(q.id).padStart(3,"0")}</span></div>
${questMetaRow(q)}
<div class="quest-desc"><div class="quest-section-title">Описание:</div><div class="quest-desc-text">${escapeHtml(q.desc)}</div></div>
${progressHtml}
${rewardPills(q.reward)}
${bonusNote ? `<div class="bonus-note">🎁 ${bonusNote}</div>` : ""}
${actionsHtml}
`;
const stepBtn = div.querySelector("[data-step]");
if(stepBtn) {
stepBtn.addEventListener("click", async ()=>{
QuestCore.advanceStep(idx);
stepBtn.classList.add('step-flash');
setTimeout(() => stepBtn.classList.remove('step-flash'), 500);
persist(); renderAll();
});
}
const completeBtn = div.querySelector("[data-complete]");
if (completeBtn) completeBtn.addEventListener("click", ()=> completeQuest(idx, false));
const bonusBtn = div.querySelector("[data-bonus]");
if(bonusBtn) bonusBtn.addEventListener("click", ()=> completeQuest(idx, true));
const failRaidBtn = div.querySelector("[data-fail-raid]");
if (failRaidBtn) {
  failRaidBtn.addEventListener("click", () => {
    showConfirm(
      '⏰ Провалить рейд',
      `Время рейда «${q.title}» истекло.\n\nПровалить без награды? (штраф отмены не применяется)`,
      () => {
        const result = QuestCore.failExpiredRaid(idx);
        if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
        state._raidExpiredNotified = false;
        if (typeof clearRaidNotification === 'function') clearRaidNotification();
        const timerEl = document.getElementById('raidTimer');
        if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
        persist();
        renderAll();
        if (result && result.q) {
          if (typeof Sound !== 'undefined') Sound.fail();
          toast(`⏰ Рейд «${result.q.title}» провален: время истекло, награда не получена`);
        }
      }
    );
  });
}
const abortBtn = div.querySelector("[data-abort]");
if(abortBtn) {
abortBtn.addEventListener("click", ()=> {
if(q.type === "рейд") {
showConfirm(
    '❌ Отмена рейда',
    `Отменить рейд «${q.title}» досрочно?\n\n⚠️ Дебафф «Слабость»: −50% XP героя на 25% длительности рейда.`,
    () => abortQuest(idx, true)
    );
} else {
    showConfirm(
        '❌ Отмена квеста',
        `Отменить квест «${q.title}»?\n\n⚠️ Будет наложен дебафф «Слабость» на XP героя.`,
        () => abortQuest(idx, false)
        );
}
});
}
active.appendChild(div);
});
}
}
// Stats
const statCompleted = document.getElementById("statCompleted");
const statFailed = document.getElementById("statFailed");
const statAborted = document.getElementById("statAborted");
if (statCompleted) statCompleted.textContent = state.quests.stats.completed;
if (statFailed) statFailed.textContent = state.quests.stats.failed;
if (statAborted) statAborted.textContent = state.quests.stats.aborted;
// Completed
if (done) {
done.innerHTML = "";
if(state.quests.completed.length === 0) {
done.innerHTML = `<div class="empty">Нет завершённых квестов</div>`;
} else {
const last10 = [...state.quests.completed].reverse().slice(0,10);
last10.forEach(q=>{
const div = document.createElement("div");
div.className = "sub";
div.style.padding = "3px 0";
div.textContent = `${q.icon} ${q.title}`;
done.appendChild(div);
});
if(state.quests.completed.length > 10) {
const div = document.createElement("div");
div.className = "sub muted";
div.style.padding = "3px 0";
div.textContent = `... и ещё ${state.quests.completed.length - 10} квестов`;
done.appendChild(div);
}
}
}
startRaidTimer();
}

function skillBarProgress(xp){
const level = getSkillLevel(xp);
const current = skillLevelFloor(level);
const next = skillLevelThreshold(level + 1);
const need = Math.max(1, next - current);
return Math.min(100, Math.max(0, ((xp - current) / need) * 100));
}

function showVictoryBanner(title, reward, items, heading, skillChanges = [], rewardMeta = null){
document.querySelectorAll(".victory-banner").forEach(el=> el.remove());
const el = document.createElement("div");
el.className = "victory-banner";
const baseReward = rewardMeta?.baseReward || reward || {};
const finalReward = reward || {};
const penalty = Math.max(0, Math.min(95, Number(rewardMeta?.heroXPPenaltyPercent) || 0));
const hasHeroXPDebuff = penalty > 0 && Number(baseReward.heroXP) > 0;
const debuffs = Array.isArray(rewardMeta?.activeRewardDebuffs) ? rewardMeta.activeRewardDebuffs : [];
const debuffLines = debuffs.map(d => {
  const pct = Math.round((1 - Number(d.heroMultiplier ?? 1)) * 100);
  return pct > 0 ? `${escapeHtml(d.name || 'Слабость')} −${pct}%` : '';
}).filter(Boolean);
const heroEffectBreakdown = typeof getActiveEffectRewardBreakdown === 'function'
  ? getActiveEffectRewardBreakdown('heroXP')
  : [];
const heroEffectMultiplier = heroEffectBreakdown.reduce((m, effect) => m * Number(effect.multiplier || 1), 1);
const coins = Number(finalReward.coins) || 0;
const itemsHtml = (items && items.length)
? `<div class="vb-section vb-items-section" data-reward-section="items">
    <div class="vb-section-title">🎁 ПРЕДМЕТЫ</div>
    <div class="pill-row vb-rewards">${items.map(it=>`<span class="pill reward-skill">🎁 ${escapeHtml(it.name || '')}</span>`).join('')}</div>
  </div>`
: '';
const coinsHtml = coins ? `
<div class="vb-section vb-coins-section" data-reward-section="coins">
  <div class="vb-section-title">🪙 МОНЕТЫ</div>
  <div class="vb-reward-number reward-coins-number" data-coins-value>+0</div>
  <div class="vb-reward-sub">монет получено</div>
</div>` : '';
const skillsHtml = skillChanges.length ? `
<div class="vb-section vb-skills" data-reward-section="skills">
  <div class="vb-section-title">🌳 НАВЫКИ — начисление XP</div>
  ${skillChanges.map((sc, i) => {
    const beforePct = skillBarProgress(sc.beforeXP);
    const afterPct = skillBarProgress(sc.afterXP);
    const remainingPct = Math.max(0, 100 - afterPct);
    const levelChanged = sc.afterLevel > sc.beforeLevel;
    return `<div class="vb-skill" data-skill-index="${i}">
      <div class="vb-skill-head">
        <span class="vb-skill-name">${escapeHtml(sc.skill)}</span>
        <span class="vb-skill-xp">+${sc.appliedXP} XP</span>
      </div>
      <div class="vb-skill-levels">
        <span>ур. ${sc.beforeLevel}</span>
        ${levelChanged ? `<b>→ ур. ${sc.afterLevel}</b>` : `<span>ур. ${sc.afterLevel}</span>`}
      </div>
      <div class="vb-skill-bar"><span style="width:${beforePct}%"></span></div>
      <div class="vb-skill-label">${sc.beforeXP} → ${sc.afterXP} XP</div>
      <div class="vb-skill-target">${levelChanged ? `⬆️ Ур. ${sc.afterLevel} · до следующего уровня ${remainingPct.toFixed(0)}%` : `До следующего уровня: ${remainingPct.toFixed(0)}%`}</div>
    </div>`;
  }).join('')}
</div>` : '';
el.innerHTML = `<div class="vb-card">

<div class="vb-title">${escapeHtml(heading || "🏆 КВЕСТ ЗАВЕРШЁН")}</div>
<div class="vb-quest">${escapeHtml(title)}</div>
<div class="vb-section vb-hero-section" data-reward-section="hero">
  <div class="vb-section-title">⭐ ОПЫТ ГЕРОЯ</div>
  <div class="vb-xp-calc" data-xp-calc>
    <div class="vb-xp-base-label">ЗА КВЕСТ</div>
    <div class="vb-xp-main" data-xp-base>+${Number(baseReward.heroXP) || 0} XP</div>
    <div class="vb-xp-result" data-xp-final>Получено: +0 XP</div>
    <div class="vb-xp-effects-inline" data-xp-modifiers>${(() => {
      const parts = [];
      heroEffectBreakdown.forEach(effect => {
        const pct = Math.round(effect.percent);
        const sign = pct >= 0 ? '+' : '−';
        const duration = effect.durationType === 'permanent' ? 'постоянный' : 'активный';
        parts.push(`${escapeHtml(effect.icon)} ${escapeHtml(effect.name)} ${sign}${Math.abs(pct)}% · ${duration}`);
      });
      if (hasHeroXPDebuff) parts.push(`⚠️ ${escapeHtml(debuffLines.join(' + ') || 'Слабость')} −${penalty}% · активный`);
      return parts.length ? parts.join(' · ') : 'Без модификаторов';
    })()}</div>
  </div>
</div>
${coinsHtml}
${skillsHtml}
${itemsHtml}
<div class="vb-skip-hint">Нажми, чтобы пропустить анимацию</div>

</div>`;
document.body.appendChild(el);

let finished = false;
let animationDone = false;
let animationDoneTimer = null;
const markAnimationDone = () => {
  if (finished || animationDone) return;
  animationDone = true;
  const hint = el.querySelector('.vb-skip-hint');
  if (hint) hint.textContent = 'Нажми, чтобы закрыть';
};
const skipAnimation = () => {
  if (finished) return;
  finished = true;
  animationDone = true;
  if (animationDoneTimer) { clearTimeout(animationDoneTimer); animationDoneTimer = null; }
  el.classList.add('skip-animation');
  const heroSection = el.querySelector('[data-reward-section="hero"]');
  if (heroSection) heroSection.classList.add('active');
  const xpBase = el.querySelector('[data-xp-base]');
  const xpFinal = el.querySelector('[data-xp-final]');
  if (xpBase) xpBase.textContent = `+${Number(baseReward.heroXP) || 0} XP`;
  if (xpFinal) xpFinal.textContent = `Получено: +${Number(finalReward.heroXP) || 0} XP`;
  const coinsValue = el.querySelector('[data-coins-value]');
  if (coinsValue) coinsValue.textContent = `+${coins}`;
  el.querySelectorAll('[data-reward-section]').forEach(section => section.classList.add('active'));
  el.querySelectorAll('.vb-skill').forEach((row, i) => {
    const sc = skillChanges[i];
    const bar = row.querySelector('.vb-skill-bar span');
    if (bar && sc) bar.style.width = skillBarProgress(sc.afterXP) + '%';
  });
};

const closeBanner = () => {
  if (!el.isConnected) return;
  el.classList.remove("show");
  setTimeout(() => {
    if (el.isConnected) el.remove();
    const levelData = pendingLevelUpData;
    pendingLevelUpData = null;
    if (levelData) showLevelUpOverlay(levelData);
    else if (typeof releaseRewardSequence === 'function') releaseRewardSequence();
  }, 600);
};

el.addEventListener('click', () => {
  if (!animationDone) skipAnimation();
  else closeBanner();
});

requestAnimationFrame(()=> requestAnimationFrame(()=> {
  el.classList.add("show");
  const heroSection = el.querySelector('[data-reward-section="hero"]');
  if (heroSection) heroSection.classList.add('active');
  const xpBase = el.querySelector('[data-xp-base]');
  const xpFinal = el.querySelector('[data-xp-final]');
  const baseXP = Number(baseReward.heroXP) || 0;
  const finalXP = Number(finalReward.heroXP) || 0;
  const heroDuration = hasHeroXPDebuff ? 1800 : 1250;
  const skillStartDelay = hasHeroXPDebuff ? 2050 : 1450;
  const skillDuration = 850;
  const skillGap = 260;

  // Главный XP теперь всегда проходит путь от 0 до фактически полученной
  // награды. При дебаффе сначала показывается базовая награда, затем её
  // уменьшение; без дебаффа идёт прямая анимация 0 → итог.
  const heroStart = performance.now();
  const animateHeroXP = now => {
    if (finished) return;
    const t = Math.min(1, (now - heroStart) / heroDuration);
    const eased = 1 - Math.pow(1 - t, 3);
    let current = 0;
    if (hasHeroXPDebuff && t < 0.34) {
      const p = t / 0.34;
      current = Math.round(baseXP * (1 - Math.pow(1 - p, 3)));
      if (xpFinal) xpFinal.textContent = `Получено: +${current} XP`;
    } else {
      const p = hasHeroXPDebuff ? Math.min(1, (t - 0.34) / 0.66) : eased;
      const applied = 1 - Math.pow(1 - p, 3);
      current = hasHeroXPDebuff
        ? Math.round(baseXP * heroEffectMultiplier - (baseXP * heroEffectMultiplier - finalXP) * applied)
        : Math.round(finalXP * applied);
      if (xpFinal) xpFinal.textContent = `Получено: +${current} XP`;
    }
    if (t < 1) requestAnimationFrame(animateHeroXP);
  };
  requestAnimationFrame(animateHeroXP);

  const animateCoins = () => {
    const section = el.querySelector('[data-reward-section="coins"]');
    const value = el.querySelector('[data-coins-value]');
    if (!section || !value) return;
    section.classList.add('active');
    const start = performance.now();
    const duration = 700;
    const frame = now => {
      if (finished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      value.textContent = `+${Math.round(coins * eased)}`;
      if (t < 1) requestAnimationFrame(frame);
      else value.textContent = `+${coins}`;
    };
    requestAnimationFrame(frame);
  };

  // Каждый навык получает свою отдельную визуальную фазу: числовой XP и
  // полоса прогресса двигаются синхронно, а при повышении уровня полоса
  // доходит до 100%, сбрасывается и показывает остаток нового уровня.
  const animateSkill = (sc, index) => {
    const row = el.querySelector(`.vb-skill[data-skill-index="${index}"]`);
    if (!row || finished) return;
    const section = el.querySelector('[data-reward-section="skills"]');
    if (section) section.classList.add('active');
    const bar = row.querySelector('.vb-skill-bar span');
    const label = row.querySelector('.vb-skill-label');
    const target = row.querySelector('.vb-skill-target');
    const levels = row.querySelector('.vb-skill-levels');
    if (!bar) return;

    const beforeXP = Number(sc.beforeXP) || 0;
    const afterXP = Number(sc.afterXP) || beforeXP;
    const beforePct = skillBarProgress(beforeXP);
    const afterPct = skillBarProgress(afterXP);
    const remainingPct = Math.max(0, 100 - afterPct);
    const levelChanged = sc.afterLevel > sc.beforeLevel;
    const start = performance.now();

    const frame = now => {
      if (finished) return;
      const t = Math.min(1, (now - start) / skillDuration);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentXP = Math.round(beforeXP + (afterXP - beforeXP) * eased);
      const currentPct = skillBarProgress(currentXP);
      bar.style.width = currentPct + '%';
      if (label) label.textContent = `${beforeXP} → ${afterXP} XP`;
      if (target) target.textContent = levelChanged && t >= .92
        ? `⬆️ Ур. ${sc.afterLevel} · до следующего уровня ${remainingPct.toFixed(0)}%`
        : (levelChanged ? `${Math.max(0, 100-currentPct).toFixed(0)}% до нового уровня` : `До следующего уровня: ${Math.max(0, 100-currentPct).toFixed(0)}%`);
      if (levels && levelChanged && t >= .92) levels.innerHTML = `<span>ур. ${sc.beforeLevel}</span><b>→ ур. ${sc.afterLevel}</b>`;

      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }

      if (levelChanged) {
        bar.style.width = '100%';
        setTimeout(() => {
          if (finished) return;
          bar.classList.add('level-reset');
          bar.style.width = afterPct + '%';
          setTimeout(() => bar.classList.remove('level-reset'), 180);
        }, 180);
      } else {
        bar.style.width = afterPct + '%';
      }
    };
    requestAnimationFrame(frame);
  };

  if (coins) setTimeout(animateCoins, hasHeroXPDebuff ? 1950 : 1250);
  skillChanges.forEach((sc, index) => {
    setTimeout(() => animateSkill(sc, index), skillStartDelay + index * skillGap);
  });
  if (items && items.length) {
    const itemsSection = el.querySelector('[data-reward-section="items"]');
    const itemsDelay = skillChanges.length
      ? skillStartDelay + (skillChanges.length - 1) * skillGap + skillDuration + 450
      : (coins ? (hasHeroXPDebuff ? 2750 : 2050) : (hasHeroXPDebuff ? 2050 : 1450));
    setTimeout(() => { if (!finished && itemsSection) itemsSection.classList.add('active'); }, itemsDelay);
  }

  const totalAnimationTime = Math.max(
    heroDuration,
    skillChanges.length ? skillStartDelay + (skillChanges.length - 1) * skillGap + skillDuration + 420 : 0
  );
  animationDoneTimer = setTimeout(markAnimationDone, totalAnimationTime);
}));
}

function showLevelUpOverlay(data){
  if (!data) return;
  if (typeof Sound !== 'undefined') Sound.levelup();
  document.querySelectorAll('.level-up-overlay').forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  const fromLevel = Number(data.fromLevel) || 0;
  const toLevel = Number(data.toLevel) || fromLevel;
  const fromPower = Number(data.fromPower) || 0;
  const toPower = Number(data.toPower) || fromPower;
  const levelsGained = Math.max(1, toLevel - fromLevel);
  const duration = 2000;
  overlay.innerHTML = `
    <div class="level-up-card">
      <div class="lu-glow"></div>
      <div class="lu-kicker">✦ ПРОГРЕСС ПЕРСОНАЖА ✦</div>
      <div class="lu-title">НОВЫЙ УРОВЕНЬ</div>
      <div class="lu-level" id="luLevelValue">${fromLevel}</div>
      <div class="lu-level-arrow">▲</div>
      <div class="lu-power-label">МОЩЬ</div>
      <div class="lu-power" id="luPowerValue">${fmt(fromPower)}</div>
      <div class="lu-power-delta" id="luPowerDelta">+0</div>
      <div class="lu-points">
        <span class="lu-point-pill">⭐ Очки SPECIAL +${levelsGained}</span>
        <span class="lu-point-pill">✨ Очки перков +${levelsGained}</span>
      </div>
      <div class="lu-skip-hint">Нажми на экран, чтобы пропустить</div>
    </div>`;
  document.body.appendChild(overlay);

  let done = false;
  let completed = false;
  let raf = null;
  const finish = () => {
    if (done || completed) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    const levelEl = overlay.querySelector('#luLevelValue');
    const powerEl = overlay.querySelector('#luPowerValue');
    const deltaEl = overlay.querySelector('#luPowerDelta');
    if (levelEl) levelEl.textContent = toLevel;
    if (powerEl) powerEl.textContent = fmt(toPower);
    if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, toPower - fromPower))}`;
    overlay.classList.add('level-up-skip');
    setTimeout(close, 420);
  };
  const close = () => {
    if (!overlay.isConnected) return;
    overlay.classList.add('hide');
    setTimeout(() => { overlay.remove(); if (typeof releaseRewardSequence === 'function') releaseRewardSequence(); }, 450);
  };
  overlay.addEventListener('click', () => {
    if (completed) close();
    else finish();
  });

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 4);
    const step = now => {
      if (done) return;
      const p = Math.min(1, (now - start) / duration);
      const e = ease(p);
      const levelValue = Math.round(fromLevel + (toLevel - fromLevel) * e);
      const powerValue = Math.round(fromPower + (toPower - fromPower) * e);
      const levelEl = overlay.querySelector('#luLevelValue');
      const powerEl = overlay.querySelector('#luPowerValue');
      const deltaEl = overlay.querySelector('#luPowerDelta');
      if (levelEl) levelEl.textContent = levelValue;
      if (powerEl) powerEl.textContent = fmt(powerValue);
      if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, powerValue - fromPower))}`;
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        done = true;
        completed = true;
        if (levelEl) levelEl.textContent = toLevel;
        if (powerEl) powerEl.textContent = fmt(toPower);
        if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, toPower - fromPower))}`;
        overlay.classList.add('level-up-complete');
      }
    };
    raf = requestAnimationFrame(step);
  });
}

function spawnBoostEffect(blockEl){
if (!blockEl) return;
const valueEl = blockEl.querySelector('.sp-value');
const letterEl = blockEl.querySelector('.sp-letter');
blockEl.classList.remove('special-awakening');
if (valueEl) valueEl.classList.remove('special-awakening');
if (letterEl) letterEl.classList.remove('special-awakening');
void blockEl.offsetWidth;
blockEl.classList.add('special-awakening');
}

function showPhaseBanner(bossName, phaseName, reward){
document.querySelectorAll(".victory-banner").forEach(el=> el.remove());
const el = document.createElement("div");
el.className = "victory-banner phase-banner";
el.innerHTML = `
<div class="vb-title">⚔️ ФАЗА ПОБЕЖДЕНА</div>
<div class="vb-quest">${escapeHtml(bossName)} — ${escapeHtml(phaseName)}</div>
${rewardPills(reward).replace('pill-row','pill-row vb-rewards')}
`;
document.body.appendChild(el);
requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add("show")));
setTimeout(()=>{
el.classList.remove("show");
setTimeout(()=> el.remove(), 600);
}, 3000);
}

function completeQuest(idx, withBonus){
const q = state.quests.active[idx];
if (q && q.type === "рейд" && typeof QuestCore !== "undefined" && QuestCore.isRaidTimeExpired && !QuestCore.isRaidTimeExpired(q)) {
  toast("⏳ Рейд ещё идёт — завершить можно только после таймера");
  return;
}
if (typeof beginRewardSequence === 'function') beginRewardSequence();
const result = QuestCore.completeQuest(idx, withBonus);
if (!result) return;
if (result.blocked) {
  if (result.reason === "raid-in-progress") toast("⏳ Рейд ещё идёт — завершить можно только после таймера");
  else toast("Активен рейд — сначала заверши его");
  return;
}
if (result.failed) {
  if (typeof releaseRewardSequence === 'function') releaseRewardSequence();
  if (typeof Sound !== 'undefined') Sound.fail();
  toast(`⏰ Рейд «${result.q.title}» провален: время истекло, награда не получена`);
  persist(); renderAll();
  return;
}
if (typeof Sound !== 'undefined') {
  if (result.q && result.q.type === 'рейд') Sound.success();
  else Sound.quest();
}
try {
  const header = document.querySelector('.header');
  if (header) {
    header.classList.remove('reward-flash');
    void header.offsetWidth;
    header.classList.add('reward-flash');
    setTimeout(() => header.classList.remove('reward-flash'), 700);
  }
} catch (_) {}
(result.events || []).forEach(ev => logEvent(ev.type, ev.icon, ev.text));
if (typeof syncAchievements === 'function') syncAchievements();
if (result.q.type === "рейд") {
  if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
  state._raidExpiredNotified = false;
  if (typeof clearRaidNotification === 'function') clearRaidNotification();
  const timerEl = document.getElementById('raidTimer');
  if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
}
persist(); renderAll();
showVictoryBanner(result.q.title, result.combined, result.droppedItems, undefined, result.skillChanges || [], result);
}

async function abortQuest(idx, isRaid) {
const result = QuestCore.abortQuest(idx, isRaid);
if (result && typeof Sound !== 'undefined') Sound.fail();
if (!result) return;
if (result.isRaid) {
  toast(`❌ Рейд отменён. «Слабость»: −50% XP героя на ${formatDebuffDuration(result.debuff?.expiresAt)}`);
} else if (result.debuff?.name === 'Изнеможение') {
  toast('❌ Квест отменён. «Изнеможение»: −75% XP героя, монет и XP навыков');
} else {
  const pct = Math.round((1 - Number(result.debuff?.heroMultiplier || 1)) * 100);
  toast(`❌ Квест отменён. «Слабость»: −${pct}% XP героя`);
}
if (result.q.type === "рейд") {
  if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
  state._raidExpiredNotified = false;
  if (typeof clearRaidNotification === 'function') clearRaidNotification();
  const timerEl = document.getElementById('raidTimer');
  if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
}
persist(); renderAll();
}

function renderSkillPicker(){
const wrap = document.getElementById("qNewSkillsPick");
if (!wrap) return;
wrap.innerHTML = "";
Object.keys(state.skills).forEach(name=>{
const label = document.createElement("label");
label.className = "skill-pick-label";
label.innerHTML = `<input type="checkbox" value="${name}"/> ${name}`;
wrap.appendChild(label);
});
wrap.querySelectorAll("input[type=checkbox]").forEach(cb=> cb.addEventListener("change", () => {
cb.closest(".skill-pick-label").classList.toggle("picked", cb.checked);
updatePreview();
}));
}

function selectedSkills(){
return Array.from(document.querySelectorAll("#qNewSkillsPick input:checked")).map(cb=>cb.value);
}

function updatePreview(){
const difficulty = document.getElementById("qNewDifficulty");
const minutes = document.getElementById("qNewMinutes");
const steps = document.getElementById("qNewSteps");
const desc = document.getElementById("qNewDesc");
const preview = document.getElementById("qNewPreview");
if (!difficulty || !minutes || !steps || !desc || !preview) return;
const diff = difficulty.value;
const min = Number(minutes.value) || 0;
const stp = Number(steps.value) || 1;
const dsc = desc.value;
const skills = selectedSkills();
const r = computeQuestReward(diff, min, stp, skills, dsc);
const skillsStr = Object.entries(r.skills).map(([k,v])=>`+${v} ${k}`).join(" · ");
const descNote = r.descBonus > 0
? ` <span class="muted">(вкл. +${r.descBonus} XP за подробное описание${r.descBonus>=DESC_XP_CAP ? ", максимум" : ""})</span>`
: ` <span class="muted">(опиши задачу подробнее — до +${DESC_XP_CAP} XP)</span>`;
const itemsNote = pendingQuestItems.length
? ` · ${pendingQuestItems.map(it=>`🎁 ${it.name}`).join(', ')}`
: '';
preview.innerHTML =
`+${r.heroXP} XP героя · +${r.coins}🪙` + (skillsStr ? " · " + skillsStr : "") + descNote + itemsNote;
}

function wireNewQuestForm(){
renderSkillPicker();
const resetBtn = document.getElementById("qNewResetBtn");
if (resetBtn) resetBtn.addEventListener("click", () => {
clearNewQuestForm();
toast("Параметры квеста сброшены");
});
["qNewDifficulty","qNewMinutes","qNewSteps"].forEach(id=>{
const el = document.getElementById(id);
if (el) {
el.addEventListener("input", updatePreview);
el.addEventListener("change", updatePreview);
}
});
const descEl = document.getElementById("qNewDesc");
if (descEl) descEl.addEventListener("input", updatePreview);
const typeEl = document.getElementById("qNewType");
if (typeEl) {
typeEl.addEventListener("change", (e)=>{
if(e.target.value === "рейд") {
const diff = document.getElementById("qNewDifficulty");
if (diff) diff.value = "epic";
}
if (typeof syncQuestTypeUI === "function") syncQuestTypeUI();
updatePreview();
});
}
updatePreview();

async function build(){
const title = document.getElementById("qNewTitle");
const desc = document.getElementById("qNewDesc");
const type = document.getElementById("qNewType");
const difficulty = document.getElementById("qNewDifficulty");
const minutes = document.getElementById("qNewMinutes");
const steps = document.getElementById("qNewSteps");
if (!title || !desc || !type || !difficulty || !minutes || !steps) return null;
const titleVal = title.value.trim();
if(!titleVal){ toast("Укажи название квеста"); return null; }
const descVal = desc.value.trim();
const typeVal = type.value;
const difficultyVal = difficulty.value;
let minutesVal = Number(minutes.value) || 0;
if (typeVal === 'рейд') {
  minutesVal = Math.min(RAID_MAX_MINUTES, Math.max(1, minutesVal));
}
const stepsVal = Math.max(1, Number(steps.value) || 1);
const skills = selectedSkills();
let reward = computeQuestReward(difficultyVal, minutesVal, stepsVal, skills, descVal);
if (pendingQuestItems.length) reward.items = pendingQuestItems.map(it => ({...it}));
const q = {
id: null, icon: typeVal==="рейд" ? "👹" : "📜", title: `«${titleVal}»`,
desc: descVal, type: typeVal, difficulty: difficultyVal, estMinutes: minutesVal || undefined,
total: stepsVal > 1 ? stepsVal : undefined, progress: stepsVal > 1 ? 0 : undefined,
reward
};
return q;
}

function syncQuestTypeUI() {
  const typeEl = document.getElementById("qNewType");
  const addPlanned = document.getElementById("qNewAddPlanned");
  const addActive = document.getElementById("qNewAddActive");
  const hint = document.getElementById("qNewTypeHint");
  const isRaid = typeEl && typeEl.value === "рейд";
  if (addPlanned) addPlanned.style.display = isRaid ? "" : "none";
  if (addActive) addActive.style.display = isRaid ? "none" : "";
  if (hint) {
    hint.textContent = isRaid
      ? "Рейд сначала попадает в запланированные. Старт — только оттуда, с подтверждением."
      : "Обычный квест сразу становится активным.";
  }
}

const addPlanned = document.getElementById("qNewAddPlanned");
if (addPlanned) {
addPlanned.addEventListener("click", async ()=>{
const q = await build(); if(!q) return;
if (q.type !== "рейд") { toast("В запланированные можно добавить только рейд"); return; }
const createdQuest = QuestCore.createQuest(q);
if (!createdQuest.ok) {
  toast(createdQuest.reason === "planned_raids_only" ? "В запланированные — только рейды" : "Не удалось создать рейд");
  return;
}
clearNewQuestForm();
persist(); renderAll();
toast("⚔️ Рейд добавлен в запланированные");
});
}
const addActive = document.getElementById("qNewAddActive");
if (addActive) {
addActive.addEventListener("click", async ()=>{
const q = await build(); if(!q) return;
if (q.type === "рейд") { toast("Рейд можно только запланировать, затем начать"); return; }
const startedQuest = QuestCore.startNewQuest(q);
if (!startedQuest.ok) {
  if (startedQuest.reason === 'raid_must_be_planned') toast('⚠️ Рейд сначала в запланированные');
  else toast('Не удалось добавить квест');
  return;
}
clearNewQuestForm();
persist(); renderAll();
toast("Квест добавлен в активные");
});
}
syncQuestTypeUI();
}

function clearNewQuestForm(){
const title = document.getElementById("qNewTitle");
const desc = document.getElementById("qNewDesc");
const minutes = document.getElementById("qNewMinutes");
const steps = document.getElementById("qNewSteps");
const difficulty = document.getElementById("qNewDifficulty");
const type = document.getElementById("qNewType");
if (title) title.value = "";
if (desc) desc.value = "";
if (minutes) minutes.value = "30";
if (steps) steps.value = "1";
if (difficulty) difficulty.value = "normal";
if (type) type.value = "обычный";
document.querySelectorAll("#qNewSkillsPick input[type=checkbox]").forEach(cb=> { cb.checked=false; cb.closest(".skill-pick-label").classList.remove("picked"); });
pendingQuestItems = [];
updatePreview();
if (typeof syncQuestTypeUI === "function") syncQuestTypeUI();
}

function showBossVictoryBanner(bossName, reward, items){
if (typeof Sound !== 'undefined') Sound.boss();
showVictoryBanner(bossName, reward, items, "👑 БОСС ПОВЕРЖЕН");
}
