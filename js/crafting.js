"use strict";

function renderCraft(){
const list = document.getElementById('recipesList');
if (!list) return;
const craftGen = getCraftGenerationLimitState();
const genBtn = document.getElementById('aiCraftRecipesBtn');
const genCountEl = document.getElementById('craftGenCountSub');
if (genCountEl) genCountEl.textContent = craftGen.count;
if (genBtn) { genBtn.textContent = `✨ AI: рецепт (${craftGen.count}/3)`; genBtn.disabled = craftGen.count >= craftGen.limit; }
if (!state.craftRecipes.length) {
list.innerHTML = `<div class="empty">Пока нет рецептов — собери материалы и нажми «AI: рецепты».</div>`;
return;
}
list.innerHTML = state.craftRecipes.map((r, idx) => {
const normalizedMaterials = (r.materials || []).map(m => typeof m === 'string' ? ({name:m, qty:1}) : m);
const matRows = normalizedMaterials.map(m => {
  const qty = Number(m.qty)||1;
  const owned = state.inventory.find(i => i.name === m.name && (i.qty||1) >= qty);
  return `<div class="item-row item-meta"><span class="item-label">${escapeHtml(m.name)}</span><span class="item-value ${owned ? 'craft-mat-ok' : 'craft-mat-missing'}">×${qty}</span></div>`;
}).join('');
const canCraft = normalizedMaterials.length >= 2 && normalizedMaterials.every(m => state.inventory.some(i => i.name === m.name && (i.qty||1) >= (Number(m.qty)||1)));
const key = 'craft:' + idx;
const isExpanded = !!expandedItems[key];
const resultType = r.type === 'consumable' ? 'Расходник' : 'Снаряжение';
const resultPower = r.type === 'equipment' ? Number(r.power) || 0 : 0;
const resultSlot = r.slot || '';
const resultDesc = r.desc || (normalizedMaterials.length ? `Скрафчивается из: ${normalizedMaterials.map(m => `${m.name} ×${Number(m.qty)||1}`).join(', ')}` : '');
const effectDuration = r.type === 'consumable' && r.durationMinutes ? normalizeConsumableDuration(r.durationMinutes) + ' мин' : '';
return `
<div class="recipe-card item-collapsible ${isExpanded ? 'is-expanded' : ''}" data-key="${key}">
  <div class="item-summary">
    <div class="item-title"><span class="ii-name">${escapeHtml(r.name)}</span>${resultPower > 0 ? `<span class="item-power">⚡ ${resultPower}</span>` : ''}</div>
    <div class="item-summary-right"><span class="rarity ${r.rarity||'common'}">${RARITY_LABEL[r.rarity]||r.rarity||'common'}</span><span class="ic-toggle">${isExpanded ? '▲' : '▼'}</span></div>
  </div>
  ${isExpanded ? `<div class="item-details">
    ${r.rarity ? `<div class="item-row item-meta"><span class="item-label">Редкость</span><span class="item-value rarity-inline ${r.rarity||'common'}">${RARITY_LABEL[r.rarity]||r.rarity}</span></div>` : ''}
    <div class="item-row item-meta"><span class="item-label">Тип</span><span class="item-value">${resultType}</span></div>
    ${resultSlot ? `<div class="item-row item-meta"><span class="item-label">Слот</span><span class="item-value">${escapeHtml(resultSlot)}</span></div>` : ''}
    ${resultDesc ? `<div class="item-row item-description"><span class="item-label">Описание</span> - <span class="item-value">${escapeHtml(resultDesc)}</span></div>` : ''}
    ${r.effect ? `<div class="item-row item-effect"><span class="item-effect-main"><span class="item-label">Эффект</span> - <span class="item-value">${escapeHtml(r.effect)}</span></span>${effectDuration ? `<span class="item-duration">${effectDuration}</span>` : ''}</div>` : ''}
    <div class="craft-recipe-materials"><div class="craft-recipe-section-title">Материалы:</div>${matRows}</div>
    <div class="actions"><button class="btn primary" data-craft="${idx}" ${canCraft ? '' : 'disabled'}>Создать</button><button class="btn danger" data-delete-recipe="${idx}">Удалить рецепт</button></div>
  </div>` : ''}
</div>`;
}).join('');
list.querySelectorAll('.item-collapsible').forEach(card => card.addEventListener('click', () => {
toggleExpanded(card.dataset.key);
renderCraft();
}));
list.querySelectorAll('[data-delete-recipe]').forEach(btn => btn.addEventListener('click', (e) => {
  e.stopPropagation();
  const idx = Number(btn.dataset.deleteRecipe);
  const recipe = state.craftRecipes[idx];
  if (!recipe) return;
  if (!confirm(`Удалить рецепт «${recipe.name || 'Без названия'}»?`)) return;
  const result = deleteCraftRecipe(idx);
  if (result?.ok) {
    persist();
    renderAll();
    toast('🗑️ Рецепт удалён');
  }
}));
list.querySelectorAll('[data-craft]').forEach(btn => btn.addEventListener('click', (e) => {
  e.stopPropagation();
  const result = craftRecipe(Number(btn.dataset.craft));
  if (!result?.ok) {
    if (result?.reason === 'missing_material') toast(`Не хватает материала: ${result.material} ×${result.qty}`);
    else if (result?.reason === 'invalid_recipe') toast('Рецепт повреждён: нужно минимум 2 материала');
    else toast('Рецепт не найден');
    return;
  }
  (result.events || []).forEach(ev => logEvent(ev.type, ev.icon, ev.text));
  persist(); renderAll();
  toast(`✅ Скрафчено: ${result.item.name}`);
  spawnCraftEffect(result.item);
}));
}

function spawnCraftEffect(item){
const existing = document.querySelector('.craft-success-overlay');
if (existing) existing.remove();
const overlay = document.createElement('div');
overlay.className = 'craft-success-overlay';
const rarity = item.rarity || 'common';
const power = Number(item.power) || 0;
const isConsumable = item.type === 'consumable';
overlay.innerHTML = `
  <div class="craft-success-card">
    <div class="craft-forge-ring"><span class="craft-forge-icon">⚒️</span></div>
    <div class="craft-success-title">${isConsumable ? 'РАСХОДНИК СОЗДАН' : 'КРАФТ ЗАВЕРШЁН'}</div>
    <div class="craft-success-item rarity ${rarity}">${escapeHtml(item.name || 'Предмет')}</div>
    <div class="craft-success-meta">${RARITY_LABEL[rarity] || rarity}${isConsumable && item.durationMinutes ? ` · ${normalizeConsumableDuration(item.durationMinutes)} мин` : ''}${!isConsumable && power > 0 ? ` · ⚡ ${power} Мощь` : ''}</div>
    <div class="craft-success-spark-field">${Array.from({length:12}, (_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
  </div>`;
document.body.appendChild(overlay);
requestAnimationFrame(() => overlay.classList.add('show'));
setTimeout(() => {
  overlay.classList.add('hide');
  setTimeout(() => overlay.remove(), 560);
}, 4200);
}


function wireCraft(){
const btn = document.getElementById('aiCraftRecipesBtn');
if (!btn) return;
btn.addEventListener('click', async () => {
if (!aiAvailable) { toast('🤖 AI недоступен'); return; }
const gen = getCraftGenerationLimitState();
if (gen.count >= gen.limit) { toast('Лимит генераций крафта на этом уровне исчерпан (3/3) — повысь уровень для новых рецептов.'); return; }
const materials = state.inventory.filter(i => i.type === 'material');
if (materials.length < 2) { toast('Нужно минимум 2 материала в инвентаре'); return; }
try {
const recipe = await withAIThinking('🤖 Придумываю рецепт...', () => generateCraftRecipesWithAI(materials));
if (!recipe) { toast('AI не смог предложить подходящий рецепт. Попробуй ещё раз.'); return; }
addCraftRecipe(recipe);
persist(); renderAll();
toast(`✅ Рецепт сгенерирован (${state.character.craftGenCount}/3 на этом уровне)`);
} catch(err) {
toastAIError(err);
}
});
}
