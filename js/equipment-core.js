"use strict";


// Game Core: equipment state transitions. No DOM, rendering or persistence here.
function getEquipmentPower(item){
  if (!item || item.type && item.type !== 'equipment') return 0;
  const base = EQUIPMENT_POWER_BY_RARITY[item?.rarity] || EQUIPMENT_POWER_BY_RARITY.common;
  const condition = getEquipmentConditionMultiplier(item?.condition);
  const slot = getEquipmentSlotMultiplier(item?.slot);
  const level = getEquipmentLevelMultiplier(item);
  return Math.max(1, Math.round(base * condition * slot * level));
}

function canEquipItem(item){
  const playerLevel = Number(S().character?.level) || 0;
  const itemLevel = getEquipmentLevel(item);
  return itemLevel <= playerLevel;
}


function equipItemCore(invId){
  const idx = S().inventory.findIndex(i => i.id === invId);
  if (idx === -1) return { ok:false, reason:'not_found' };
  const item = S().inventory[idx];
  if (item.type !== 'equipment' || !item.slot) return { ok:false, reason:'not_equippable', item };
  if (!canEquipItem(item)) return { ok:false, reason:'level_required', item, requiredLevel:getEquipmentLevel(item), playerLevel:Number(S().character?.level)||0 };
  if (isAccessorySlot(item.slot)) return equipAccessoryCore(invId, item.slot);

  const old = S().equipment[item.slot];
  if (old) {
    if (typeof removeActiveEffectsBySource === 'function' && old.effectId) removeActiveEffectsBySource('equipment', old.effectId);
    InventoryCore.add({ name: old.name, type:'equipment', rarity:old.rarity, condition:old.condition,
      desc:old.desc, effect:old.effect, modifiers:old.modifiers, power:getEquipmentPower(old), itemLevel:getEquipmentLevel(old), slot:item.slot, source:'unequip' });
  }
  S().equipment[item.slot] = {
    name:item.name, desc:item.desc || '', rarity:item.rarity || 'common',
    condition:EQUIPMENT_CONDITION_ALIASES[item.condition] || item.condition || 'good', effect:item.effect || '', power:getEquipmentPower(item),
    itemLevel:getEquipmentLevel(item), slot:item.slot || 'Рюкзак',
    modifiers:item.modifiers && typeof item.modifiers === 'object' ? JSON.parse(JSON.stringify(item.modifiers)) : null,
    effectId:item.effect ? `equip_${Date.now()}_${Math.floor(Math.random()*100000)}` : null
  };
  if (item.qty > 1) item.qty--; else S().inventory.splice(idx, 1);
  const equipped = S().equipment[item.slot];
  if (equipped?.effect && typeof upsertActiveEffect === 'function') upsertActiveEffect({
    id:`equipment:${equipped.effectId}`, sourceType:'equipment', sourceId:equipped.effectId, type:'positive',
    name:equipped.name, effect:equipped.effect, icon:SLOT_ICON?.[item.slot] || '🛡️',
    durationType:'permanent', startsAt:0, expiresAt:null,
    meta:{slot:item.slot, rarity:equipped.rarity || 'common', modifiers:equipped.modifiers || {}}
  });
  return { ok:true, item, replaced:old };
}

function equipAccessoryCore(invId, slot){
  const idx = S().inventory.findIndex(i => i.id === invId);
  if (idx === -1) return { ok:false, reason:'not_found' };
  const item = S().inventory[idx];
  if (!item || item.type !== 'equipment') return { ok:false, reason:'not_equippable', item };
  if (!canEquipItem(item)) return { ok:false, reason:'level_required', item, requiredLevel:getEquipmentLevel(item), playerLevel:Number(S().character?.level)||0 };
  if (!S().accessories[slot]) S().accessories[slot] = [];
  const equippedAccessory = {
    name:item.name, desc:item.desc || '', rarity:item.rarity || 'common',
    condition:EQUIPMENT_CONDITION_ALIASES[item.condition] || item.condition || 'good', effect:item.effect || '', power:getEquipmentPower(item), itemLevel:getEquipmentLevel(item), slot,
    modifiers:item.modifiers && typeof item.modifiers === 'object' ? JSON.parse(JSON.stringify(item.modifiers)) : null,
    effectId:item.effect ? `equip_${Date.now()}_${Math.floor(Math.random()*100000)}` : null
  };
  S().accessories[slot].push(equippedAccessory);
  if (item.qty > 1) item.qty--; else S().inventory.splice(idx, 1);
  if (equippedAccessory.effect && typeof upsertActiveEffect === 'function') upsertActiveEffect({
    id:`equipment:${equippedAccessory.effectId}`, sourceType:'equipment', sourceId:equippedAccessory.effectId, type:'positive',
    name:equippedAccessory.name, effect:equippedAccessory.effect, icon:SLOT_ICON?.[slot] || '🛡️',
    durationType:'permanent', startsAt:0, expiresAt:null,
    meta:{slot, rarity:equippedAccessory.rarity || 'common', modifiers:equippedAccessory.modifiers || {}}
  });
  return { ok:true, item };
}

function unequipAccessoryCore(slot, index){
  const arr = S().accessories[slot];
  if (!arr || !arr[index]) return { ok:false, reason:'not_found' };
  const item = arr[index];
  if (typeof removeActiveEffectsBySource === 'function' && item.effectId) removeActiveEffectsBySource('equipment', item.effectId);
  InventoryCore.add({ name:item.name, type:'equipment', rarity:item.rarity, condition:item.condition,
    desc:item.desc, effect:item.effect, modifiers:item.modifiers, power:getEquipmentPower(item), itemLevel:getEquipmentLevel(item), slot, source:'unequip' });
  arr.splice(index, 1);
  return { ok:true, item };
}

function unequipEquippedCore(slot){
  const item = S().equipment[slot];
  if (!item) return { ok:false, reason:'not_found' };
  if (typeof removeActiveEffectsBySource === 'function' && item.effectId) removeActiveEffectsBySource('equipment', item.effectId);
  InventoryCore.add({ name:item.name, type:'equipment', rarity:item.rarity, condition:item.condition,
    desc:item.desc, effect:item.effect, modifiers:item.modifiers, power:getEquipmentPower(item), itemLevel:getEquipmentLevel(item), slot, source:'unequip' });
  S().equipment[slot] = null;
  return { ok:true, item };
}

function discardEquippedCore(slot){
  const item = S().equipment[slot];
  if (!item) return { ok:false, reason:'not_found' };
  if (typeof removeActiveEffectsBySource === 'function' && item.effectId) removeActiveEffectsBySource('equipment', item.effectId);
  S().equipment[slot] = null;
  return { ok:true, item };
}

function discardAccessoryCore(slot, index){
  const arr = S().accessories[slot];
  if (!arr || !arr[index]) return { ok:false, reason:'not_found' };
  const item = arr[index];
  if (typeof removeActiveEffectsBySource === 'function' && item.effectId) removeActiveEffectsBySource('equipment', item.effectId);
  arr.splice(index, 1);
  return { ok:true, item };
}
