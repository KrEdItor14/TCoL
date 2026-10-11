"use strict";

function getActiveBoss() { return BossCore.getActiveBoss(); }
function currentBossPhase(boss) { return BossCore.currentPhase(boss); }


let bossRemovalTimerHandle = null;

function formatBossRemovalCountdown(ms){
const total = Math.max(0, Math.ceil(ms / 1000));
const minutes = Math.floor(total / 60);
const seconds = total % 60;
return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startBossRemovalTimers(){
if (bossRemovalTimerHandle) return;
const tick = () => {
const now = Date.now();
let changed = false;
for (let i = state.bosses.length - 1; i >= 0; i--){
const boss = state.bosses[i];
if (!boss.removeAt) continue;
const remaining = boss.removeAt - now;
const timerEl = document.getElementById(`bossRemoval_${boss.id}`);
if (remaining <= 0){
const removed = BossCore.remove(i);
if (!removed) continue;
changed = true;
continue;
}
if (timerEl) timerEl.textContent = `Удаление босса через ${formatBossRemovalCountdown(remaining)}`;
}
if (changed){
persist();
renderAll();
}
if (!state.bosses.some(b => b.removeAt)){
clearInterval(bossRemovalTimerHandle);
bossRemovalTimerHandle = null;
}
};
if (state.bosses.some(b => b.removeAt)){
tick();
bossRemovalTimerHandle = setInterval(tick, 250);
}
}

function armBossRemovalTimer(boss){
boss.removeAt = Date.now() + 60000;
persist();
renderBosses();
startBossRemovalTimers();
}

function renderBosses(){
const list = document.getElementById("bossList");
if (!list) return;
list.innerHTML = "";
if(state.bosses.length === 0) {
list.innerHTML = `<div class="empty">Нет боссов. Добавьте первого!</div>`;
return;
}
state.bosses.forEach((boss, idx) => {
const isActive = boss.id === state.activeBossId;
const isFinancial = boss.bossType !== 'other';
const unit = boss.unit || (isFinancial ? '₽' : 'ед.');
const totalProgress = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const pct = (totalProgress / boss.target * 100);
const remaining = Math.max(0, boss.target - totalProgress);
// Финансовый босс — это "здоровье", которое тает от урона (внесённых денег):
// полоска стартует полной и опустышается к 0, а не заполняется с нуля.
const barPct = isFinancial ? (remaining / boss.target * 100) : pct;
const barGradient = isFinancial ? 'linear-gradient(90deg,var(--red),#ff8a3d)' : 'linear-gradient(90deg,#ff8a3d,var(--gold))';
const createdLabel = boss.createdAt ? new Date(boss.createdAt).toLocaleDateString('ru-RU') : '—';
const cache = bossBarCache[boss.id] || null;
const initialHpPct = cache ? cache.hp : Math.min(100, barPct);
const initialPhasePcts = boss.phases.map((p, i) => {
const target = Math.min(100, p.progress/p.target*100);
return cache && cache.phases && cache.phases[i] !== undefined ? cache.phases[i] : target;
});
const isDefeated = !!(boss.victoryPending || boss.victoryRewarded || boss.removeAt);
const div = document.createElement("div");
div.className = "card";
div.dataset.bossCard = boss.id;
div.style.borderColor = isActive && !isDefeated ? "var(--phosphor)" : "var(--line)";
div.innerHTML = `
<h3>${escapeHtml(boss.name)} ${isActive && !isDefeated ? '🟢' : ''}</h3>
<div class="sub">${escapeHtml(boss.goal)}</div>
<div class="sub">📅 Создан: ${createdLabel}</div>
${isDefeated ? `
<div class="boss-phases-collapsed">
<span>⚔️ Все 3 фазы завершены</span>
<span>${boss.removeAt ? `<strong id="bossRemoval_${boss.id}">Удаление босса через ${formatBossRemovalCountdown(boss.removeAt - Date.now())}</strong>` : (boss.victoryPending ? '⚠️ Награда AI ещё не выдана' : '🤖 Ожидание награды AI')}</span>
</div>` : `
<div class="xp-row" style="margin-top:8px;">
<div class="bar boss-bar"><span id="bossHpFill_${boss.id}" style="width:${initialHpPct}%; background:${barGradient};"></span></div>
<span>${isFinancial ? '❤️ ' + barPct.toFixed(1) + '%' : pct.toFixed(1) + '%'}</span>
</div>
<div style="font-size:11px; color:var(--phosphor-dim); margin:4px 0;">
${isFinancial
? `HP босса: ${fmt(remaining)} / ${fmt(boss.target)} ${unit}`
: `${fmt(totalProgress)} / ${fmt(boss.target)} ${unit}`}
</div>
<div id="bossPhases_${boss.id}" style="margin-top:8px;"></div>`}
${!isActive && !isDefeated ? `<div class="actions"><button class="btn primary" data-setactive="${idx}">Сделать активным</button></div>` : ''}
${boss.victoryPending && !boss.removeAt ? `<div class="actions"><button class="btn primary bossRetryRewardBtn" data-bossid="${boss.id}">🤖 Повторить выдачу награды</button></div>` : ''}
${!isDefeated ? `<div class="actions"><button class="btn danger" data-delboss="${idx}">Удалить босса</button></div>` : ''}
`;
const phasesContainer = div.querySelector(`#bossPhases_${boss.id}`);
if (phasesContainer) boss.phases.forEach((p, i) => {
const phaseDiv = document.createElement("div");
phaseDiv.className = "boss-phase" + (p.defeated ? " defeated":"");
const localPct = Math.min(100, p.progress/p.target*100);
phaseDiv.innerHTML = `
<div class="ph-h"><span>${p.defeated ? "🟢":"🔴"} ${escapeHtml(p.name)} — ${fmt(p.target)} ${escapeHtml(unit)}</span><span>${p.defeated ? "побеждена" : fmt(p.progress)+" / "+fmt(p.target)}</span></div>
<div class="bar boss-bar" style="margin-top:4px;"><span id="bossPhaseFill_${boss.id}_${i}" style="width:${initialPhasePcts[i]}%"></span></div>
`;
phasesContainer.appendChild(phaseDiv);
});
// Запоминаем целевые (истинные) значения для следующего рендера —
// именно ОТ них в следующий раз стартует анимация.
bossBarCache[boss.id] = {
hp: Math.min(100, barPct),
phases: boss.phases.map(p => Math.min(100, p.progress/p.target*100))
};
if(!isDefeated) {
const inputDiv = document.createElement("div");
inputDiv.innerHTML = `
${isActive ? `
<hr class="rule">
<label class="field">Внести ${unit} в текущую фазу (урон боссу)
<input class="bossAddInput" data-bossid="${boss.id}" type="number" min="1" placeholder="${isFinancial ? 'сумма в рублях' : 'кол-во ' + unit}" />
</label>
<div class="actions">
<button class="btn primary bossAddBtn" data-bossid="${boss.id}">Внести</button>
</div>` : ''}
${isFinancial ? `
<label class="field" style="margin-top:8px;">Вернуть ₽ из накоплений (отхил босса)
<input class="bossHealInput" data-bossid="${boss.id}" type="number" min="1" placeholder="сумма в рублях" />
</label>
<div class="actions">
<button class="btn warning bossHealBtn" data-bossid="${boss.id}">❤️ Отхилить</button>
</div>` : ''}
`;
div.appendChild(inputDiv);
}
list.appendChild(div);
});
startBossRemovalTimers();
// Полосы вставлены с их СТАРЫМИ значениями ширины — на следующем кадре
// проставляем настоящие цели, чтобы сработал CSS-переход (3с).
requestAnimationFrame(() => {
state.bosses.forEach(boss => {
const cache = bossBarCache[boss.id];
if (!cache) return;
const hpFill = document.getElementById(`bossHpFill_${boss.id}`);
if (hpFill) hpFill.style.width = cache.hp + '%';
boss.phases.forEach((p, i) => {
const phaseFill = document.getElementById(`bossPhaseFill_${boss.id}_${i}`);
if (phaseFill) phaseFill.style.width = cache.phases[i] + '%';
});
});
});
// Event listeners
document.querySelectorAll('[data-setactive]').forEach(btn => {
btn.addEventListener('click', () => {
const idx = parseInt(btn.dataset.setactive);
BossCore.setActive(idx);
persist(); renderAll();
toast(`Активный босс: ${state.bosses[idx].name}`);
});
});
document.querySelectorAll('.bossRetryRewardBtn').forEach(btn => {
btn.addEventListener('click', async () => {
const bossId = btn.dataset.bossid;
const boss = state.bosses.find(b => b.id === bossId);
if (!boss || boss.removeAt || boss.victoryRewarded || boss.victoryRewardGenerating) return;
await finalizeBossVictory(boss);
});
});

document.querySelectorAll('[data-delboss]').forEach(btn => {
btn.addEventListener('click', () => {
const idx = parseInt(btn.dataset.delboss);
const boss = state.bosses[idx];
showConfirm(
'⚠️ Удаление босса',
`Вы уверены, что хотите удалить босса "${boss.name}"? Весь прогресс будет потерян.`,
() => {
BossCore.remove(idx);
persist(); renderAll();
toast(`Босс "${boss.name}" удалён`);
}
);
});
});
function spawnBossHitEffect(anchor){
  if (!anchor) return;
  const host = anchor.closest('.card') || anchor;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const burst = document.createElement('div');
  burst.className = 'boss-hit-burst';
  for (let i = 0; i < 6; i++) {
    const shard = document.createElement('span');
    shard.style.setProperty('--dx', `${Math.cos((Math.PI * 2 * i) / 6) * 26}px`);
    shard.style.setProperty('--dy', `${Math.sin((Math.PI * 2 * i) / 6) * 18}px`);
    burst.appendChild(shard);
  }
  host.appendChild(burst);
  setTimeout(() => burst.remove(), 520);
}

function animateBossDamage(bossId, amount, oldHpPct, newHpPct, oldPhasePct, newPhasePct, isFinal){
  const card = document.querySelector(`[data-boss-card="${bossId}"]`);
  if (!card) return;
  card.classList.remove('boss-damage-impact', 'boss-damage-final');
  void card.offsetWidth;
  card.classList.add(isFinal ? 'boss-damage-final' : 'boss-damage-impact');

  const float = document.createElement('div');
  float.className = 'boss-damage-float';
  float.textContent = `⚔️ −${fmt(amount)} ₽`;
  card.appendChild(float);
  setTimeout(() => float.remove(), 900);

  const hpFill = document.getElementById(`bossHpFill_${bossId}`);
  if (hpFill && !isFinal){
    hpFill.style.transition = 'none';
    hpFill.style.width = oldHpPct + '%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hpFill.style.transition = 'width .75s cubic-bezier(.25,.8,.25,1)';
      hpFill.style.width = newHpPct + '%';
    }));
  }
  const boss = state.bosses.find(b => b.id === bossId);
  if (boss && !isFinal){
    const phaseIndex = boss.phases.findIndex(p => !p.defeated);
    if (phaseIndex >= 0){
      const phaseFill = document.getElementById(`bossPhaseFill_${bossId}_${phaseIndex}`);
      if (phaseFill){
        phaseFill.style.transition = 'none';
        phaseFill.style.width = oldPhasePct + '%';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          phaseFill.style.transition = 'width .75s cubic-bezier(.25,.8,.25,1)';
          phaseFill.style.width = newPhasePct + '%';
        }));
      }
    }
  }
  setTimeout(() => card.classList.remove('boss-damage-impact', 'boss-damage-final'), 850);
}

function animateBossHeal(bossId, amount, oldHpPct, newHpPct, oldPhasePct, newPhasePct){
const card = document.querySelector(`[data-boss-card="${bossId}"]`);
if (!card) return;

card.classList.remove('boss-heal-impact');
void card.offsetWidth;
card.classList.add('boss-heal-impact');

const float = document.createElement('div');
float.className = 'boss-heal-float';
float.textContent = `❤️ +${fmt(amount)} ₽`;
card.appendChild(float);
setTimeout(() => float.remove(), 1000);

const hpFill = document.getElementById(`bossHpFill_${bossId}`);
if (hpFill){
  hpFill.style.transition = 'none';
  hpFill.style.width = oldHpPct + '%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hpFill.style.transition = 'width .9s cubic-bezier(.22,.7,.2,1)';
      hpFill.style.width = newHpPct + '%';
    });
  });
}

const boss = state.bosses.find(b => b.id === bossId);
if (boss){
  const phaseIndex = boss.phases.findIndex(p => !p.defeated);
  if (phaseIndex >= 0){
    const phaseFill = document.getElementById(`bossPhaseFill_${bossId}_${phaseIndex}`);
    if (phaseFill){
      phaseFill.style.transition = 'none';
      phaseFill.style.width = oldPhasePct + '%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          phaseFill.style.transition = 'width .9s cubic-bezier(.22,.7,.2,1)';
          phaseFill.style.width = newPhasePct + '%';
        });
      });
    }
  }
}

const cushionFlash = document.createElement('div');
cushionFlash.className = 'boss-cushion-heal';
cushionFlash.textContent = `💰 +${fmt(amount)} ₽`;
cushionFlash.setAttribute('aria-hidden', 'true');
document.body.appendChild(cushionFlash);
setTimeout(() => cushionFlash.remove(), 1000);
setTimeout(() => card.classList.remove('boss-heal-impact'), 900);
}

document.querySelectorAll('.bossHealBtn').forEach(btn => {
btn.addEventListener('click', () => {
const bossId = btn.dataset.bossid;
const input = document.querySelector(`.bossHealInput[data-bossid="${bossId}"]`);
const amount = Math.floor(Number(input.value));
if(!amount || amount <= 0){ toast("Укажи сумму для отхила"); return; }
const boss = state.bosses.find(b => b.id === bossId);
if(!boss || boss.bossType === 'other') return;
const phase = currentBossPhase(boss);
if(!phase){ toast("У босса нет активной фазы"); return; }
const oldRemaining = Math.max(0, boss.target - boss.phases.reduce((s, p) => s + Math.min(p.progress, p.target), 0));
const oldBossHpPct = Math.min(100, oldRemaining / boss.target * 100);
const oldPhasePct = Math.min(100, phase.progress / phase.target * 100);
const result = BossCore.heal(boss, amount);
if (!result.ok) { toast(result.message); return; }
input.value = "";
const newRemaining = Math.max(0, boss.target - boss.phases.reduce((s, p) => s + Math.min(p.progress, p.target), 0));
const newBossHpPct = Math.min(100, newRemaining / boss.target * 100);
const newPhasePct = Math.min(100, phase.progress / phase.target * 100);
logEvent('boss', '❤️', `${boss.name}: босс восстановил ${fmt(result.amount)} ₽`);
persist(); renderAll();
animateBossHeal(boss.id, result.amount, oldBossHpPct, newBossHpPct, oldPhasePct, newPhasePct);
toast(`❤️ Босс восстановил ${fmt(result.amount)} ₽`);
});
});

document.querySelectorAll('.bossAddBtn').forEach(btn => {
btn.addEventListener('click', async () => {
const bossId = btn.dataset.bossid;
const input = document.querySelector(`.bossAddInput[data-bossid="${bossId}"]`);
const amount = Math.floor(Number(input.value));
if(!amount || amount <= 0){ toast("Укажи сумму"); return; }
const boss = state.bosses.find(b => b.id === bossId);
if(!boss) return;
const beforeTotal = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const beforeRemaining = Math.max(0, boss.target - beforeTotal);
const beforeHpPct = Math.min(100, beforeRemaining / boss.target * 100);
const beforePhase = currentBossPhase(boss);
const beforePhasePct = beforePhase ? Math.min(100, beforePhase.progress / beforePhase.target * 100) : 0;
const result = BossCore.damage(boss, amount);
if (!result.ok) { toast(result.message); return; }
input.value = "";
(result.events || []).forEach(ev => logEvent(ev.type, ev.icon, ev.text));
if (typeof syncAchievements === 'function') syncAchievements();
const appliedDamage = result.appliedDamage;
const bossDefeated = result.defeated;
if (appliedDamage > 0) {
  persist(); renderAll();
  const hpBarEl = document.getElementById(`bossHpFill_${bossId}`);
  spawnBossHitEffect(hpBarEl ? hpBarEl.parentElement : document.querySelector(`[data-boss-card="${bossId}"]`));
  animateBossDamage(boss.id, appliedDamage, beforeHpPct, result.afterHpPct, beforePhasePct, result.afterPhasePct, bossDefeated);
}
if (!bossDefeated) {
for (let i = 0; i < result.defeatedThisHit.length; i++){
const phase = result.defeatedThisHit[i];
setTimeout(() => showPhaseBanner(boss.name, phase.name, phase.reward), i * 3200);
}
} else if (!boss.victoryRewarded) {
boss.victoryPending = true;
persist(); renderAll();
setTimeout(() => finalizeBossVictory(boss), 350);
}
});
});
}

async function finalizeBossVictory(boss){
if (!boss || boss.victoryRewarded || boss.victoryRewardGenerating) return;
boss.victoryPending = true;
if (!boss.victoryLogged) {
logEvent('boss', '👹', `Победа над ${boss.name}`);
boss.victoryLogged = true;
}
if (!aiAvailable) {
persist(); renderAll();
toast('🤖 AI сейчас недоступен. Когда он станет доступен, нажми «Повторить выдачу награды».');
return;
}
boss.victoryRewardGenerating = true;
persist(); renderAll();
try {
const result = await withAIThinking('🤖 Готовлю награду за победу...', () => generateBossVictoryRewardWithAI(boss));
let item = null;
if (result.item && result.item.name) {
item = addInventoryItem({ ...result.item, source: 'boss:' + boss.name });
}
if (result.achievement && result.achievement.title) {
if (typeof AchievementCore !== 'undefined') AchievementCore.registerCustomAchievement({
icon: result.achievement.icon || '🏆',
id: 'boss:' + Date.now(),
title: result.achievement.title,
desc: result.achievement.desc || '',
rank: 1
});
}
const bonusCoins = Number(result.bonusCoins) || 0;
if (bonusCoins) addCoins(bonusCoins, `Победа над ${boss.name}`);
persist(); renderAll();
showBossVictoryBanner(boss.name, { heroXP:0, coins: bonusCoins, skills:{} }, item ? [item] : []);
boss.victoryPending = false;
boss.victoryRewardGenerating = false;
boss.victoryRewarded = true;
armBossRemovalTimer(boss);
if (result.achievement && result.achievement.title) {
if (typeof queueAchievementUnlock === 'function') {
queueAchievementUnlock({ icon: result.achievement.icon || '🏆', title: result.achievement.title, desc: result.achievement.desc || 'Персональное достижение за победу над боссом.', rank: 'I', previousRank: null, currentValueText: 'Получено', nextThresholdText: null, unit: '', isMaxRank: false });
} else {
toast(`🏆 Новое достижение: ${result.achievement.title}`);
}
}
} catch(err) {
console.error(err);
boss.victoryRewardGenerating = false;
boss.victoryPending = true;
persist(); renderAll();
if (err.cancelled) {
toast('⏹ Генерация награды отменена. Босс повержен — награду можно выдать повторно.');
} else {
toast('❌ AI не смог выдать награду. Босс повержен — нажми «Повторить выдачу награды», когда AI снова будет доступен.');
}
}
}

function wireBossCreation(){
const typeEl = document.getElementById("bossNewType");
const targetLabel = document.getElementById("bossNewTargetLabel");
const unitWrap = document.getElementById("bossNewUnitWrap");
if (typeEl) {
typeEl.addEventListener("change", () => {
const isFinancial = typeEl.value === "financial";
if (targetLabel) targetLabel.firstChild.textContent = isFinancial ? "Целевая сумма, ₽" : "Целевая величина";
if (unitWrap) unitWrap.style.display = isFinancial ? "none" : "block";
});
}
const addBtn = document.getElementById("bossNewAdd");
if (!addBtn) return;
addBtn.addEventListener("click", () => {
const name = document.getElementById("bossNewName");
const goal = document.getElementById("bossNewGoal");
const target = document.getElementById("bossNewTarget");
const unitEl = document.getElementById("bossNewUnit");
if (!name || !goal || !target) return;
const bossType = typeEl ? typeEl.value : "financial";
const nameVal = name.value.trim();
const goalVal = goal.value.trim();
const targetVal = Number(target.value);
const unitVal = bossType === "financial" ? "₽" : ((unitEl && unitEl.value.trim()) || "ед.");
if(!nameVal){ toast("Укажи имя босса"); return; }
if(!goalVal){ toast("Укажи цель босса"); return; }
if(!targetVal || targetVal <= 0){ toast("Укажи корректную целевую величину"); return; }
// Награда за фазу — только XP персонажа и одного навыка, без монет:
// монеты боссы больше не платят, это не их роль в экономике.
const phaseSplit = bossType === "financial" ? [0.2, 0.3, 0.5] : [0.34, 0.33, 0.33];
const phaseRewards = [
{heroXP: 80, skills: {"💰 Финансы": 40}},
{heroXP: 150, skills: {"💰 Финансы": 70}},
{heroXP: 280, skills: {"💰 Финансы": 120}},
];
const romanNames = ["Фаза I", "Фаза II", "Фаза III"];
const boss = {
id: "boss_" + Date.now(),
name: nameVal,
goal: goalVal,
target: targetVal,
bossType,
unit: unitVal,
createdAt: Date.now(),
victoryRewarded: false,
phases: phaseSplit.map((frac, i) => ({
name: romanNames[i],
target: Math.round(targetVal * frac),
progress: 0,
defeated: false,
reward: phaseRewards[i],
applied: false
}))
};
if (!BossCore.create(boss)) return;
name.value = "";
goal.value = "";
target.value = "";
if (unitEl) unitEl.value = "";
persist(); renderAll();
toast(`Босс "${nameVal}" добавлен!`);
});
}
