"use strict";

const ITEM_TYPE_LABEL = { material: 'Материал', consumable: 'Расходник', equipment: 'Снаряжение' };

let inventoryFilter = 'all';

function discardInventoryItem(invId){
    const item = state.inventory.find(i => i.id === invId);
    if (!item) return;
    if (item.qty > 1 && item.type === 'consumable') {
      useConsumable(invId);
      return;
    }
    showConfirm(
      '🗑️ Выбросить предмет',
      `Безвозвратно выбросить «${item.name}»? Отменить это будет нельзя.`,
      () => {
        const result = InventoryCore.discard(invId);
        if (!result) return;
        persist();
        renderAll();
        toast(`Выброшено: ${result.name || item.name}`);
      }
    );
}

function itemPowerHtml(item){
  return item.type === 'equipment' ? `<span class="item-power">⚡ ${getEquipmentPower(item)}</span>` : '';
}

function itemEffectHtml(item){
  if (!item.effect) return '';
  const duration = item.durationMinutes ? ` <span class="item-duration">${normalizeConsumableDuration(item.durationMinutes)} мин</span>` : '';
  return `<div class="item-row item-effect"><span class="item-effect-main"><span class="item-label">Эффект</span> - <span class="item-value">${escapeHtml(item.effect)}</span></span>${duration}</div>`;
}

function renderItemCard(item, key, actionsHtml=''){
  const isExpanded = !!expandedItems[key];
  return `
<div class="inv-item item-collapsible ${isExpanded ? 'is-expanded' : ''}" data-key="${key}">
  <div class="item-summary">
    <div class="item-title"><span class="ii-name">${escapeHtml(item.name)}${item.qty>1 ? ` ×${item.qty}` : ''}</span>${itemPowerHtml(item)}</div>
    <div class="item-summary-right"><span class="rarity ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span><span class="ic-toggle">${isExpanded ? '▲' : '▼'}</span></div>
  </div>
  ${isExpanded ? `<div class="item-details">
    ${item.rarity ? `<div class="item-row item-meta"><span class="item-label">Редкость</span><span class="item-value rarity-inline ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span></div>` : ''}
    ${item.condition ? `<div class="item-row item-meta"><span class="item-label">Состояние</span><span class="item-value cond-inline cond-${item.condition}">${CONDITION_ICON[item.condition]||''} ${CONDITION_LABEL[item.condition]||item.condition}</span></div>` : ''}
    <div class="item-row item-meta"><span class="item-label">Тип</span><span class="item-value">${ITEM_TYPE_LABEL[item.type]||item.type}</span></div>
    ${item.slot ? `<div class="item-row item-meta"><span class="item-label">Слот</span><span class="item-value">${escapeHtml(item.slot)}</span></div>` : ''}
    ${item.desc ? `<div class="item-row item-description"><span class="item-label">Описание</span> - <span class="item-value">${escapeHtml(item.desc)}</span></div>` : ''}
    ${itemEffectHtml(item)}
    ${item.secondaryEffect ? `<div class="item-row item-effect"><span class="item-effect-main"><span class="item-label">Эффект</span> - <span class="item-value">${escapeHtml(item.secondaryEffect)}</span></span>${item.secondaryDurationMinutes ? `<span class="item-duration">${normalizeConsumableDuration(item.secondaryDurationMinutes)} мин</span>` : ''}</div>` : ''}
    ${item.quote ? `<div class="item-row item-note"><span class="item-label">Примечание</span><span class="item-value">«${escapeHtml(item.quote)}»</span></div>` : ''}
    ${actionsHtml ? `<div class="actions">${actionsHtml}</div>` : ''}
  </div>` : ''}
</div>`;
}

function spawnItemActionEffect(item, mode){
  // mode: 'use' | 'equip' — visual language matches craft success
  const existing = document.querySelector('.item-action-overlay');
  if (existing) existing.remove();
  if (!item) return;
  const overlay = document.createElement('div');
  const isUse = mode === 'use';
  overlay.className = 'item-action-overlay ' + (isUse ? 'use-mode' : 'equip-mode');
  const rarity = item.rarity || 'common';
  const icon = isUse ? '🧪' : '🛡️';
  const title = isUse ? 'РАСХОДНИК ИСПОЛЬЗОВАН' : 'СНАРЯЖЕНИЕ НАДЕТО';
  let meta = (typeof RARITY_LABEL !== 'undefined' && RARITY_LABEL[rarity]) ? RARITY_LABEL[rarity] : rarity;
  if (isUse && item.durationMinutes && typeof normalizeConsumableDuration === 'function') {
    meta += ` · ${normalizeConsumableDuration(item.durationMinutes)} мин`;
  }
  if (!isUse && item.slot) meta += ` · ${item.slot}`;
  if (!isUse && item.power) meta += ` · ⚡ ${Number(item.power) || 0}`;
  overlay.innerHTML = `
    <div class="item-action-card">
      <div class="item-action-ring"><span class="item-action-icon">${icon}</span></div>
      <div class="item-action-title">${title}</div>
      <div class="item-action-item rarity ${rarity}">${escapeHtml(item.name || 'Предмет')}</div>
      <div class="item-action-meta">${escapeHtml(meta)}</div>
      <div class="item-action-sparks">${Array.from({length:12}, (_,i)=>`<i style="--i:${i}"></i>`).join('')}</div>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  setTimeout(() => {
    overlay.classList.add('hide');
    setTimeout(() => overlay.remove(), 480);
  }, 2800);
}

function useConsumable(invId){
    const card = document.querySelector(`.item-collapsible[data-key="inv:${CSS.escape(String(invId))}"]`)
      || document.querySelector(`[data-use="${CSS.escape(String(invId))}"]`)?.closest('.item-collapsible');
    if (card) {
      card.classList.remove('item-use-flash');
      void card.offsetWidth;
      card.classList.add('item-use-flash');
    }
    const result = InventoryCore.useConsumable(invId);
    if (!result) return;
    if (typeof Sound !== 'undefined') Sound.consumable();
    if (result.error) { if (result.toast) toast(result.toast); return; }
    if (result.item) spawnItemActionEffect(result.item, 'use');
    if (result.toast) toast(result.toast);
    persist();
    setTimeout(() => { renderAll(); }, card ? 320 : 0);
}

function renderInventory(){
const list = document.getElementById('inventoryList');
if (!list) return;
const items = state.inventory.filter(i => inventoryFilter === 'all' || i.type === inventoryFilter);
if (!items.length) { list.innerHTML = `<div class="empty">Пусто.</div>`; return; }
list.innerHTML = items.map(item => {
  const actions = `${item.type === 'equipment' ? `<button class="btn primary" data-equip="${item.id}">Экипировать</button>` : ''}${item.type === 'consumable' ? `<button class="btn gold" data-use="${item.id}">🧪 Использовать</button>` : ''}<button class="btn warn" data-discard="${item.id}">${item.qty>1 && item.type === 'consumable' ? 'Использовать ×1' : item.qty>1 ? 'Выбросить ×1' : 'Выбросить'}</button>`;
  return renderItemCard(item, 'inv:' + item.id, actions);
}).join('');
list.querySelectorAll('.item-collapsible').forEach(card => card.addEventListener('click', () => {
  toggleExpanded(card.dataset.key);
  renderInventory();
}));
list.querySelectorAll('[data-equip]').forEach(btn => btn.addEventListener('click', e => {
  e.stopPropagation();
  const card = btn.closest('.item-collapsible');
  if (card) {
    card.classList.remove('item-equip-flash');
    void card.offsetWidth;
    card.classList.add('item-equip-flash');
    setTimeout(() => equipItemFromInventory(btn.dataset.equip), 180);
  } else {
    equipItemFromInventory(btn.dataset.equip);
  }
}));
list.querySelectorAll('[data-discard]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); discardInventoryItem(btn.dataset.discard); }));
list.querySelectorAll('[data-use]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); useConsumable(btn.dataset.use); }));
}

function wireInventoryFilters(){
const wrap = document.getElementById('invFilters');
if (!wrap) return;
wrap.querySelectorAll('button[data-filter]').forEach(btn => {
btn.addEventListener('click', () => {
inventoryFilter = btn.dataset.filter;
wrap.querySelectorAll('button[data-filter]').forEach(b => b.classList.toggle('active', b === btn));
renderInventory();
});
});
}
