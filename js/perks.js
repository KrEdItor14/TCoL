"use strict";

const MAX_AVAILABLE_PERKS = PerksCore.MAX_AVAILABLE;

const SUPER_PERK_CHANCE = 0.15; // 15% шанс на сверхсильный перк при каждой генерации

function showPerkSlotChoice(perks, onChoose){
const existing = document.querySelector('.confirm-overlay');
if (existing) existing.remove();
const overlay = document.createElement('div');
overlay.className = 'confirm-overlay';
const optionsHtml = perks.map((p, i) => `
<button class="btn warn" data-slotidx="${i}" style="display:block; width:100%; text-align:left; margin-bottom:6px; white-space:normal;">
${i+1}. ${escapeHtml(p.name || 'Без названия')}${p.desc ? ` — ${escapeHtml(p.desc)}` : ''}
</button>
`).join('');
overlay.innerHTML = `
<div class="confirm-box">
<h3>🔄 Освободить слот перка</h3>
<p>Уже сгенерировано максимум перков (3/3), которые ещё не куплены. Выбери, какой из них заменить новым:</p>
<div style="margin:10px 0;">${optionsHtml}</div>
<div class="actions">
<button class="btn" id="confirmCancel">Отмена</button>
</div>
</div>
`;
document.body.appendChild(overlay);
overlay.querySelectorAll('[data-slotidx]').forEach(btn => btn.addEventListener('click', () => {
overlay.remove();
onChoose(Number(btn.dataset.slotidx));
}));
overlay.querySelector('#confirmCancel').addEventListener('click', () => overlay.remove());
overlay.addEventListener('click', (e) => {
if (e.target === overlay) overlay.remove();
});
}

function checkPerkCondition(perk){
if (!perk.condition) return true;
const { type, key, min } = perk.condition;
const value = type === 'special' ? (state.special[key] || 0) : (state.skills[key] || 0);
return value >= min;
}

function perkConditionText(perk){
if (!perk.condition) return '';
const { key, min } = perk.condition;
return `${key} ≥ ${min}`;
}

function renderPerks(){
const elPoints = document.getElementById("perkPointsSub");
const elGenCount = document.getElementById("perkGenCountSub");
const elUnlocked = document.getElementById("unlockedPerks");
const elAvailable = document.getElementById("availablePerks");
if (elPoints) elPoints.textContent = state.character.perkPoints;
if (elGenCount) elGenCount.textContent = state.character.perkGenCount;
if (elUnlocked) {
elUnlocked.innerHTML = state.perksUnlocked.map(p=>{
const name = typeof p === 'string' ? p : p.name;
const effects = typeof p === 'string' ? [] : (p.effects || []);
const isSuper = typeof p !== 'string' && p.isSuper;
const effectsHtml = effects.map(e => `<div class="trait">✨ ${escapeHtml(e)}</div>`).join('');
return `<div class="sub" style="margin-bottom:8px;">🔓 <b style="color:var(--phosphor-bright)">${isSuper ? '🌟 ' : ''}${escapeHtml(name)}</b>${effectsHtml}</div>`;
}).join("") || `<div class="empty">Пусто</div>`;
}
if (elAvailable) {
elAvailable.innerHTML = "";
state.perksAvailable.forEach((perk, idx)=>{
const met = checkPerkCondition(perk);
const canAfford = state.character.perkPoints >= perk.cost;
const effectsList = perk.effects && perk.effects.length ? perk.effects : (perk.effect ? [perk.effect] : []);
const effectsHtml = effectsList.map(e => `<div class="trait">✨ ${escapeHtml(e)}</div>`).join('');
const row = document.createElement("div");
row.className = "quest";
row.innerHTML = `
<div class="qh"><span class="title">${perk.isSuper ? '🌟 ' : ''}${escapeHtml(perk.name)}${perk.isSuper ? ' <span class="badge raid">СВЕРХСИЛЬНЫЙ</span>' : ''}</span><span class="qid">${perk.cost}⭐</span></div>
<div class="desc">${escapeHtml(perk.desc)}</div>
${effectsHtml}
${perk.condition ? `<div class="sub">Условие: ${perkConditionText(perk)}</div>` : ''}
<div class="sub">Статус: ${met ? '✅ Доступен' : '🔒 Условие не выполнено'}</div>
<div class="actions"><button class="btn primary" data-idx="${idx}" ${(met && canAfford) ? '' : 'disabled'}>Разблокировать</button></div>
`;
row.querySelector("button").addEventListener("click", async ()=>{
if(!checkPerkCondition(perk)){ toast("Условие для этого перка ещё не выполнено"); return; }
if(state.character.perkPoints < perk.cost){ toast("Недостаточно очков перков"); return; }
const unlockResult = PerksCore.unlock(idx, true);
if (!unlockResult.ok) {
if (unlockResult.reason === "points") toast("Недостаточно очков перков");
return;
}
if (typeof syncAchievements === 'function') syncAchievements();
logEvent('perk', '⭐', `Разблокирован перк: ${perk.name}`);
persist(); renderAll();
toast(`Перк разблокирован: ${perk.name}`);
});
elAvailable.appendChild(row);
});
if(!state.perksAvailable.length) elAvailable.innerHTML = `<div class="empty">Нет доступных перков</div>`;
}
}

async function generatePerkWithAI(isSuper, bonusCount){
const skillList = Object.entries(state.skills).map(([k,v])=>`${k}: ${v} XP`).join(', ');
const specialList = Object.entries(state.special).map(([k,v])=>`${k}: ${v}`).join(', ');
const specialKeys = Object.keys(state.special);
if (isSuper) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\nТы — генератор редкого сверхсильного пассивного перка. Условие обязательно: существующий навык или SPECIAL. Навыки: ${SKILL_NAMES.join(', ')}. SPECIAL: ${specialKeys.join(', ')}. Ровно ${bonusCount} разных effects. Сила идёт за счёт количества, а не больших чисел.\nJSON: {"name":"название с эмодзи","desc":"1-2 предложения","effects":["бонус 1"],"conditionType":"skill","conditionKey":"🔧 Практические навыки","conditionMin":150}\nconditionMin обычно 150-350 для навыка или 8-10 для SPECIAL. Верни только JSON.`;
return await queryAI(`Создай редкий сверхсильный перк. Текущие навыки: ${skillList}. Текущие SPECIAL: ${specialList}.`, systemPrompt);
}
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\nТы — генератор обычного пассивного перка. Условие обязательно и логично связано с существующим навыком или SPECIAL. Навыки: ${SKILL_NAMES.join(', ')}. SPECIAL: ${specialKeys.join(', ')}. Один короткий effect в пределах +1..+5 или 1-15%. Не используй XP, монеты или Мощь напрямую.\nJSON: {"name":"название с эмодзи","desc":"1-2 предложения","effect":"короткий эффект","conditionType":"skill","conditionKey":"🔧 Практические навыки","conditionMin":100,"cost":1}\nconditionMin: 20-300 для навыков или 6-10 для SPECIAL; cost 1-2. Верни только JSON.`;
return await queryAI(`Создай новый перк. Текущие навыки: ${skillList}. Текущие SPECIAL: ${specialList}.`, systemPrompt);
}

function wireAIPerkGeneration(){
const btn = document.getElementById('aiGeneratePerkBtn');
if (!btn) return;
btn.addEventListener('click', () => {
if (!aiAvailable) { toast('🤖 AI недоступен. Проверьте интернет-соединение.'); return; }
PerksCore.syncGenerationLevel();
if (!PerksCore.canGenerate()) {
toast(`Лимит генераций перков на этом уровне исчерпан (${PerksCore.getGenerationLimit()}/${PerksCore.getGenerationLimit()}) — повысь уровень для новых попыток.`);
return;
}
const runGeneration = async (replaceIdx) => {
// Розыгрыш редкого "сверхсильного" перка: 3-6 бонусов вместо одного,
// и цена сразу 2-4 очка перков (а не обычные 1-2).
const isSuper = Math.random() < SUPER_PERK_CHANCE;
const bonusCount = isSuper ? (3 + Math.floor(Math.random() * 4)) : 1; // 3..6
try {
const result = await withAIThinking(
isSuper ? '🌟 Придумываю сверхсильный перк...' : '🤖 Придумываю перк...',
() => generatePerkWithAI(isSuper, bonusCount)
);
const conditionType = result.conditionType === 'special' ? 'special' : 'skill';
const validKeys = conditionType === 'special' ? Object.keys(state.special) : SKILL_NAMES;
const conditionKey = validKeys.includes(result.conditionKey) ? result.conditionKey : validKeys[0];
const effects = isSuper
? (Array.isArray(result.effects) && result.effects.length ? result.effects.slice(0, 6) : ['✨ мощный эффект'])
: [result.effect || ''];
const perk = {
name: result.name || '✨ Новый перк',
desc: result.desc || '',
effects,
isSuper,
cost: isSuper ? (2 + Math.floor(Math.random() * 3)) : Math.max(1, Math.min(2, Number(result.cost) || 1)), // super: 2..4
condition: { type: conditionType, key: conditionKey, min: Number(result.conditionMin) || 10 }
};
// Слоты уже заняты (проверено ДО генерации) — заменяем выбранный,
// а не просто дописываем в конец, иначе после апдейта лимита их
// стало бы больше 3 при следующей генерации.
const addResult = PerksCore.addGenerated(perk, replaceIdx);
if (!addResult.ok) {
if (addResult.reason === "generation_limit") toast(`Лимит генераций перков на этом уровне исчерпан (${PerksCore.getGenerationLimit()}/${PerksCore.getGenerationLimit()}).`);
else if (addResult.reason === "available_limit") toast("Нет свободного слота для нового перка.");
return;
}
persist(); renderAll();
toast(isSuper
? `🌟 Выпал СВЕРХСИЛЬНЫЙ перк: ${perk.name} (${effects.length} бонусов)!`
: `✅ Перк сгенерирован: ${perk.name} (${PerksCore.getGenerationCount()}/${PerksCore.getGenerationLimit()} на этом уровне)`);
} catch(err) {
toastAIError(err);
}
};
// Максимум 3 сгенерированных, но ещё не купленных перка одновременно —
// если слоты уже заняты, сначала спрашиваем, какой освободить.
if (state.perksAvailable.length >= MAX_AVAILABLE_PERKS) {
showPerkSlotChoice(state.perksAvailable, (idx) => runGeneration(idx));
} else {
runGeneration(null);
}
});
}
