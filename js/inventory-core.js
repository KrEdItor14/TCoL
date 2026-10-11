"use strict";


// Inventory Core: game-state mutations only. No DOM, rendering or persistence side effects.
const InventoryCore = (() => {
    function cloneModifiers(modifiers){
        return modifiers && typeof modifiers === 'object'
            ? JSON.parse(JSON.stringify(modifiers))
            : null;
    }

    // Совместимость со стандартными расходниками старых сохранений,
    // созданных до введения структурированных modifiers.
    function getLegacyConsumableModifiers(item){
        if (item?.modifiers && typeof item.modifiers === 'object') return cloneModifiers(item.modifiers);
        const name = String(item?.name || '');
        if (name.includes('Кофе растворимый с молоком')) return {skillPercent:{"🧘 Концентрация":5,"⚡ Продуктивность":3}};
        if (name.includes('Кофе растворимый')) return {skillPercent:{"🧘 Концентрация":5}};
        if (name.includes('Чай из пакетика')) return {skillPercent:{"🗣️ Коммуникация":3}};
        if (name.includes('Банка энергетика')) return {skillPercent:{"⚡ Продуктивность":8}};
        return null;
    }

    function getSecondaryConsumableModifiers(item){
        if (item?.secondaryModifiers && typeof item.secondaryModifiers === 'object') return cloneModifiers(item.secondaryModifiers);
        const name = String(item?.name || '');
        if (name.includes('Банка энергетика')) return {skillPercent:{"🧘 Концентрация":3}};
        return null;
    }

    function add(item){
        const entry = {
            name: item.name || '✨ Загадочный предмет',
            type: (item.type === 'consumable' || item.type === 'equipment') ? item.type : 'material',
            rarity: item.type === 'consumable' ? (RARITY_ORDER.includes(item.rarity) ? item.rarity : rollConsumableRarity()) : (item.rarity || 'common'),
            condition: item.type === 'equipment' ? (EQUIPMENT_CONDITION_ALIASES[item.condition] || item.condition || 'good') : undefined,
            itemLevel: item.type === 'equipment' ? getEquipmentLevel(item) : null,
            power: item.type === 'equipment' ? getEquipmentPower({ ...item, itemLevel: getEquipmentLevel(item) }) : null,
            desc: item.desc || '',
            effect: item.effect || '',
            durationMinutes: item.type === 'consumable' ? normalizeConsumableDuration(item.durationMinutes, 30) : null,
            secondaryEffect: item.type === 'consumable' ? (item.secondaryEffect || '') : '',
            secondaryDurationMinutes: item.type === 'consumable' && item.secondaryDurationMinutes ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15) : 0,
            slot: item.type === 'equipment' ? (item.slot || EQUIP_SLOTS[0]) : null,
            quote: item.quote || '',
            source: item.source || 'ai',
            modifiers: cloneModifiers(item.modifiers),
            secondaryModifiers: item.type === 'consumable' ? cloneModifiers(item.secondaryModifiers) : null,
            secondaryEffectType: item.type === 'consumable' ? (item.secondaryEffectType || 'negative') : null
        };
        if (entry.type !== 'equipment') {
            const existing = S().inventory.find(i => i.name === entry.name && i.type === entry.type);
            if (existing) {
                existing.qty = (existing.qty || 1) + 1;
                if (typeof AchievementCore !== 'undefined') AchievementCore.registerInventoryObtained(1);
                return existing;
            }
        }
        entry.id = 'item_' + Date.now() + '_' + Math.floor(Math.random()*10000);
        entry.qty = 1;
        S().inventory.push(entry);
        if (typeof AchievementCore !== 'undefined') AchievementCore.registerInventoryObtained(1);
        if (entry.type === 'equipment' && typeof AchievementCore !== 'undefined') AchievementCore.registerEquipmentObtained(entry.name);
        return entry;
    }

    function discard(invId){
        const idx = S().inventory.findIndex(i => i.id === invId);
        if (idx === -1) return null;
        const item = S().inventory[idx];
        if (item.qty > 1) item.qty--; else S().inventory.splice(idx, 1);
        return { id: invId, remainingQty: Math.max(0, (item.qty || 1) - (item.qty > 1 ? 1 : 1)) };
    }

    function useConsumable(invId){
        const idx = S().inventory.findIndex(i => i.id === invId);
        if (idx === -1) return null;
        const item = S().inventory[idx];
        if (item.type !== 'consumable') {
            return { error: true, toast: 'Это не расходник' };
        }
        const durationMinutes = normalizeConsumableDuration(item.durationMinutes, 30);
        const primaryModifiers = getLegacyConsumableModifiers(item);
        const secondaryModifiers = getSecondaryConsumableModifiers(item);
        if (!S().buffs) S().buffs = [];
        const now = Date.now();
        S().buffs = S().buffs.filter(b => b.expiresAt > now);
        if (item.effect) {
            const buffId = 'buff_' + Date.now() + '_' + Math.floor(Math.random()*10000);
            const buff = {
                id: buffId,
                name: item.name, effect: item.effect, startedAt: now, durationMinutes,
                expiresAt: now + durationMinutes * 60 * 1000
            };
            S().buffs.push(buff);
            if (typeof upsertActiveEffect === 'function') upsertActiveEffect({
                id:`buff:${buffId}`, sourceType:'consumable', sourceId:buffId, type:'positive',
                name:item.name, effect:item.effect, icon:'🧪', durationType:'timed',
                startsAt:now, expiresAt:buff.expiresAt, meta:{durationMinutes, modifiers:primaryModifiers || {}}
            });
        }
        if (item.secondaryEffect && item.secondaryDurationMinutes > 0) {
            const secondaryId = 'buff_secondary_' + Date.now() + '_' + Math.floor(Math.random()*10000);
            const secondary = {
                id: secondaryId,
                name: item.name + ' · последействие', effect: item.secondaryEffect,
                startedAt: now + durationMinutes * 60 * 1000,
                durationMinutes: item.secondaryDurationMinutes,
                expiresAt: now + (durationMinutes + item.secondaryDurationMinutes) * 60 * 1000,
                startsAt: now + durationMinutes * 60 * 1000
            };
            S().buffs.push(secondary);
            const secondaryType = item.secondaryEffectType || (/[-−]\s*\d+%/.test(String(item.secondaryEffect || '')) ? 'negative' : 'positive');
            if (typeof upsertActiveEffect === 'function') upsertActiveEffect({
                id:`buff:${secondaryId}`, sourceType:'consumable', sourceId:secondaryId, type:secondaryType,
                name:secondary.name, effect:secondary.effect, icon:'⏳', durationType:'timed',
                startsAt:secondary.startsAt, expiresAt:secondary.expiresAt, meta:{durationMinutes:item.secondaryDurationMinutes, pending:true, modifiers:secondaryModifiers || {}}
            });
        }
        if (typeof AchievementCore !== 'undefined') AchievementCore.registerConsumableUsed();
        const snapshot = {
            name: item.name,
            rarity: item.rarity || 'common',
            type: item.type,
            effect: item.effect || '',
            durationMinutes: durationMinutes,
            icon: item.icon || '🧪'
        };
        if (item.qty > 1) item.qty--; else S().inventory.splice(idx, 1);
        return {
            item: snapshot,
            toast: snapshot.effect
                ? `✨ Использован: ${snapshot.name} — ${snapshot.effect} (${formatBuffDuration(durationMinutes * 60 * 1000)})`
                : `Использован: ${snapshot.name}`
        };
    }

    return { add, discard, useConsumable };
})();

function addInventoryItem(item){ return InventoryCore.add(item); }

