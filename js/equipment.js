"use strict";

let openSlotPicker = null;

function equipItemFromInventory(invId){
const result = equipItemCore(invId);
if (!result.ok) {
  if (result.reason === 'not_equippable') toast('Этот предмет нельзя экипировать');
  if (result.reason === 'level_required') toast(`🔒 Требуется ${result.requiredLevel} уровень персонажа (сейчас: ${result.playerLevel})`);
  return;
}
if (isAccessorySlot(result.item.slot)) {
  if (typeof syncAchievements === 'function') syncAchievements();
  persist(); renderAll();
  if (typeof Sound !== 'undefined') Sound.equip();
  if (typeof spawnItemActionEffect === 'function') spawnItemActionEffect(result.item, 'equip');
  requestAnimationFrame(() => animateEquipmentSlot(result.item.slot));
  toast(`Экипировано: ${result.item.name}`);
  return;
}
if (typeof syncAchievements === 'function') syncAchievements();
persist(); renderAll();
if (typeof Sound !== 'undefined') Sound.equip();
if (typeof spawnItemActionEffect === 'function') spawnItemActionEffect(result.item, 'equip');
requestAnimationFrame(() => animateEquipmentSlot(result.item.slot));
toast(`Экипировано: ${result.item.name}`);
}

function equipAccessoryFromInventory(invId, slot){
const result = equipAccessoryCore(invId, slot);
if (!result.ok) { if (result.reason === 'level_required') toast(`🔒 Требуется ${result.requiredLevel} уровень персонажа (сейчас: ${result.playerLevel})`); return; }
if (typeof syncAchievements === 'function') syncAchievements();
persist(); renderAll();
if (typeof Sound !== 'undefined') Sound.equip();
if (typeof spawnItemActionEffect === 'function') spawnItemActionEffect(result.item, 'equip');
requestAnimationFrame(() => animateEquipmentSlot(result.item.slot));
toast(`Экипировано: ${result.item.name}`);
}

function unequipSlot(slot){
const result = unequipEquippedCore(slot);
if (!result.ok) return;
if (typeof syncAchievements === 'function') syncAchievements();
persist(); renderAll();
toast(`Снято: ${result.item.name}`);
}

function discardEquippedSlot(slot){
const item = state.equipment[slot];
if (!item) return;
showConfirm(
'🗑️ Выкинуть предмет',
`Безвозвратно выкинуть "${item.name}"? Отменить это будет нельзя.`,
() => {
const result = discardEquippedCore(slot);
if (!result.ok) return;
if (typeof syncAchievements === 'function') syncAchievements();
persist(); renderAll();
toast(`Выброшено: ${result.item.name}`);
}
);
}

function discardAccessory(slot, index){
const arr = state.accessories[slot];
if (!arr || !arr[index]) return;
const item = arr[index];
showConfirm(
'🗑️ Выкинуть предмет',
`Безвозвратно выкинуть "${item.name}"? Отменить это будет нельзя.`,
() => {
const result = discardAccessoryCore(slot, index);
if (!result.ok) return;
if (typeof syncAchievements === 'function') syncAchievements();
persist(); renderAll();
toast(`Выкинуто: ${result.item.name}`);
}
);
}

function animateEquipmentSlot(slot){
  if (!slot) return;
  const escaped = CSS.escape(String(slot));
  const card = document.querySelector(`#slotsList .slot-card[data-slot="${escaped}"]`)
    || document.querySelector(`#accessorySlotsList .slot-card[data-accslot="${escaped}"]`);
  if (!card) return;
  card.classList.remove('equipment-equip-pulse');
  void card.offsetWidth;
  card.classList.add('equipment-equip-pulse');
  setTimeout(() => card.classList.remove('equipment-equip-pulse'), 900);
}

function toggleExpanded(key){ expandedItems[key] = !expandedItems[key]; }

function itemDetailsHtml(item, actionsHtml=''){
  return `<div class="item-details">
    <div class="item-row item-meta"><span class="item-label">Редкость</span><span class="item-value rarity-inline ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span></div>
    ${item.condition ? `<div class="item-row item-meta"><span class="item-label">Состояние</span><span class="item-value cond-inline cond-${item.condition}">${CONDITION_ICON[item.condition]||''} ${CONDITION_LABEL[item.condition]||item.condition}</span></div>` : ''}
    <div class="item-row item-meta"><span class="item-label">Тип</span><span class="item-value">Снаряжение</span></div>
    ${item.slot ? `<div class="item-row item-meta"><span class="item-label">Слот</span><span class="item-value">${escapeHtml(item.slot)}</span></div>` : ''}
    ${item.desc ? `<div class="item-row item-description"><span class="item-label">Описание</span> - <span class="item-value">${escapeHtml(item.desc)}</span></div>` : ''}
    ${item.effect ? `<div class="item-row item-effect"><span class="item-effect-main"><span class="item-label">Эффект</span> - <span class="item-value">${escapeHtml(item.effect)}</span></span>${item.durationMinutes ? `<span class="item-duration">${normalizeConsumableDuration(item.durationMinutes)} мин</span>` : ''}</div>` : ''}
    ${actionsHtml ? `<div class="actions">${actionsHtml}</div>` : ''}
  </div>`;
}

function renderSlots(){
  const wrap = document.getElementById('slotsList');
  if (!wrap) return;
  wrap.innerHTML = EQUIP_SLOTS.map(slot => {
    const item = state.equipment[slot];
    const picking = openSlotPicker === slot;
    const key = 'equip:' + slot;
    const isExpanded = !!expandedItems[key];
    let html = `<div class="slot-card ${item ? 'item-collapsible' : ''}" data-slot="${slot}" data-key="${key}">`;
    if (item) {
      html += `<div class="item-summary"><div class="item-title"><span class="sc-name">${escapeHtml(item.name)}</span><span class="item-power">⚡ ${getEquipmentPower(item)}</span></div><div class="item-summary-right"><span class="rarity ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span><span class="ic-toggle">${isExpanded ? '▲' : '▼'}</span></div></div>`;
      if (isExpanded) html += itemDetailsHtml(item, `<button class="btn" data-changeslot="${slot}">Сменить</button><button class="btn" data-unequipslot="${slot}">Снять</button><button class="btn danger" data-discardslot="${slot}">Выбросить</button>`);
    } else {
      html += `<div class="sc-top"><span class="sc-slot">${SLOT_ICON[slot]||''} ${slot}</span></div><div class="sc-empty">Пусто — нажми, чтобы экипировать</div>`;
    }
    if (picking) {
      const candidates = state.inventory.filter(i => i.type === 'equipment' && i.slot === slot && canEquipItem(i));
      html += `<div class="slot-picker">${candidates.length ? candidates.map(c => `<div class="pick-item"><span>${escapeHtml(c.name)}</span><button class="btn primary" data-pick="${c.id}">Экипировать</button></div>`).join('') : `<div class="empty">Нет подходящих предметов в инвентаре для слота «${slot}».</div>`}</div>`;
    }
    return html + '</div>';
  }).join('');
  wrap.querySelectorAll('[data-changeslot]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openSlotPicker = openSlotPicker === btn.dataset.changeslot ? null : btn.dataset.changeslot; renderSlots(); }));
  wrap.querySelectorAll('[data-unequipslot]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); unequipSlot(btn.dataset.unequipslot); }));
  wrap.querySelectorAll('[data-discardslot]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); discardEquippedSlot(btn.dataset.discardslot); }));
  wrap.querySelectorAll('[data-pick]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); equipItemFromInventory(btn.dataset.pick); openSlotPicker = null; }));
  wrap.querySelectorAll('.slot-card').forEach(card => card.addEventListener('click', e => {
    if (e.target.closest('button')) return;
    const slot = card.dataset.slot;
    if (state.equipment[slot]) { toggleExpanded(card.dataset.key); renderSlots(); }
    else { openSlotPicker = openSlotPicker === slot ? null : slot; renderSlots(); }
  }));
}

function renderAccessorySlots(){
  const wrap = document.getElementById('accessorySlotsList');
  if (!wrap) return;
  wrap.innerHTML = ACCESSORY_SLOTS.map(slot => {
    const items = state.accessories[slot] || [];
    const itemsHtml = items.map((item, i) => {
      const key = `acc:${slot}:${i}`;
      const isExpanded = !!expandedItems[key];
      const actions = `<button class="btn" data-unequipacc="${slot}" data-idx="${i}">Снять</button><button class="btn danger" data-discardacc="${slot}" data-idx="${i}">Выбросить</button>`;
      return `<div class="acc-item item-collapsible" data-key="${key}"><div class="item-summary"><div class="item-title"><span class="sc-name">${escapeHtml(item.name)}</span><span class="item-power">⚡ ${getEquipmentPower(item)}</span></div><div class="item-summary-right"><span class="rarity ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span><span class="ic-toggle">${isExpanded ? '▲' : '▼'}</span></div></div>${isExpanded ? itemDetailsHtml(item, actions) : ''}</div>`;
    }).join('');
    return `<div class="slot-card" data-accslot="${slot}" style="cursor:default;"><div class="sc-top"><span class="sc-slot">${SLOT_ICON[slot]||''} ${slot}</span><span class="sc-count">${items.length ? items.length + ' шт.' : ''}</span></div>${itemsHtml || '<div class="sc-empty">Пусто</div>'}</div>`;
  }).join('');
  wrap.querySelectorAll('.acc-item').forEach(card => card.addEventListener('click', e => { if (e.target.closest('button')) return; toggleExpanded(card.dataset.key); renderAccessorySlots(); }));
  wrap.querySelectorAll('[data-unequipacc]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); unequipAccessory(btn.dataset.unequipacc, Number(btn.dataset.idx)); }));
  wrap.querySelectorAll('[data-discardacc]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); discardAccessory(btn.dataset.discardacc, Number(btn.dataset.idx)); }));
}

async function generateEquipmentWithAI(theme, slotHint){
const level = Math.max(1, Number(state.character?.level) || 1);
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор экипировки TCoL. Предмет должен быть физически представимым и пригодным для реальной жизни, но оформленным как RPG-экипировка. Слоты: ${ALL_SLOTS.join(', ')}. Редкости: common/uncommon/rare/epic/legendary/unique/mythical. Состояния: broken/damaged/worn/good/reliable/excellent/perfect. itemLevel ОБЯЗАТЕЛЬНО ${level}. Не указывай power: Мощь рассчитывает игра. quote запрещён.\nJSON: {"name":"название с эмодзи","desc":"описание, назначение и атмосфера","rarity":"rare","condition":"good","itemLevel":${level},"effect":"реалистичный эффект","slot":"Голова"}\nВерни только JSON.`;
const prompt = `Придумай один предмет снаряжения на тему: "${theme || 'что-нибудь полезное на каждый день'}".` + (slotHint ? ` Слот уже выбран: "${slotHint}".` : ' Выбери логичный слот сам.');
const result = await queryAI(prompt, systemPrompt);
if (result && typeof result === 'object') delete result.quote;
return result;
}

function clearGearForm(){
const nameEl = document.getElementById('gearNewName');
const descEl = document.getElementById('gearNewDesc');
const rarityEl = document.getElementById('gearNewRarity');
const condEl = document.getElementById('gearNewCondition');
const effectEl = document.getElementById('gearNewEffect');
const slotEl = document.getElementById('gearNewSlot');
if (nameEl) nameEl.value = '';
if (descEl) descEl.value = '';
if (rarityEl) rarityEl.value = 'common';
if (condEl) condEl.value = 'good';
if (effectEl) effectEl.value = '';
if (slotEl) slotEl.value = EQUIP_SLOTS[0];
}

let pendingAIGearPower = null;

function wireGearCreation(){
const addBtn = document.getElementById('gearNewAdd');
if (addBtn) {
addBtn.addEventListener('click', () => {
const name = document.getElementById('gearNewName').value.trim();
const desc = document.getElementById('gearNewDesc').value.trim();
const rarity = document.getElementById('gearNewRarity').value;
const condition = document.getElementById('gearNewCondition').value;
const effect = document.getElementById('gearNewEffect').value.trim();
const slot = document.getElementById('gearNewSlot').value;
if (!name) { toast('Укажи название предмета'); return; }
const added = addInventoryItem({ name, desc, rarity, condition, effect, itemLevel: Number(state.character?.level) || 1, slot, type: 'equipment', source: 'manual' });
pendingAIGearPower = null;
clearGearForm();
persist(); renderAll();
toast(`Добавлено в инвентарь: ${added.name}`);
});
}
const resetBtn = document.getElementById('gearNewResetBtn');
if (resetBtn) {
resetBtn.addEventListener('click', () => {
clearGearForm();
toast('Параметры снаряжения сброшены');
});
}
const aiBtn = document.getElementById('aiGenerateEquipmentBtn');
if (aiBtn) {
aiBtn.addEventListener('click', async () => {
if (!aiAvailable) { toast('🤖 AI недоступен. Проверьте интернет-соединение.'); return; }
const theme = (document.getElementById('aiGearTheme')?.value || '').trim();
const slotSelect = document.getElementById('gearNewSlot');
const slotHint = slotSelect ? slotSelect.value : null;
try {
const result = await withAIThinking('🤖 Придумываю снаряжение...', () => generateEquipmentWithAI(theme, slotHint));
const nameEl = document.getElementById('gearNewName');
const descEl = document.getElementById('gearNewDesc');
const rarityEl = document.getElementById('gearNewRarity');
const condEl = document.getElementById('gearNewCondition');
const effectEl = document.getElementById('gearNewEffect');
const slotEl = document.getElementById('gearNewSlot');
if (nameEl) nameEl.value = result.name || '';
if (descEl) descEl.value = result.desc || '';
if (rarityEl && RARITY_ORDER.includes(result.rarity)) rarityEl.value = result.rarity;
if (condEl && CONDITION_LABEL[result.condition]) condEl.value = result.condition;
if (effectEl) effectEl.value = result.effect || '';
pendingAIGearPower = null;
if (slotEl && ALL_SLOTS.includes(result.slot)) slotEl.value = result.slot;
toast('✅ Снаряжение сгенерировано — проверь поля и нажми «Добавить в инвентарь»');
} catch(err) {
toastAIError(err);
}
});
}
}

function unequipAccessory(slot, index){
const result = unequipAccessoryCore(slot, index);
if (!result.ok) return;
persist(); renderAll();
toast(`Снято: ${result.item.name}`);
}
