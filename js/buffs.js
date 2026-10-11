"use strict";

let activeBuffExpandedId = null;

function formatBuffDuration(ms){
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const sec = totalSeconds % 60;
    if (h > 0) return `${h}ч ${String(m).padStart(2,'0')}м`;
    return `${m}:${String(sec).padStart(2,'0')}`;
}

function normalizeActiveEffect(effect){
    if (!effect || typeof effect !== 'object') return null;
    const now = Date.now();
    const type = effect.type || (effect.kind === 'debuff' ? 'negative' : 'positive');
    const sourceType = effect.sourceType || effect.kind || 'other';
    const permanent = effect.durationType === 'permanent' || effect.expiresAt === null;
    return {
        id: String(effect.id || `effect_${Date.now()}_${Math.floor(Math.random()*10000)}`),
        sourceType,
        sourceId: effect.sourceId ?? null,
        type,
        name: String(effect.name || 'Активный эффект'),
        effect: String(effect.effect || ''),
        icon: String(effect.icon || (type === 'negative' ? '⚠️' : sourceType === 'equipment' ? '🛡️' : '✨')),
        durationType: permanent ? 'permanent' : 'timed',
        startsAt: Number(effect.startsAt ?? effect.startedAt ?? now) || now,
        expiresAt: permanent ? null : (Number(effect.expiresAt) || now),
        stack: Math.max(1, Number(effect.stack) || 1),
        meta: effect.meta && typeof effect.meta === 'object' ? effect.meta : {}
    };
}

function ensureActiveEffects(){
    if (!Array.isArray(state.activeEffects)) state.activeEffects = [];
    return state.activeEffects;
}

function upsertActiveEffect(effect){
    const normalized = normalizeActiveEffect(effect);
    if (!normalized) return null;
    const list = ensureActiveEffects();
    const index = list.findIndex(e => e.id === normalized.id);
    if (index >= 0) list[index] = {...list[index], ...normalized};
    else list.push(normalized);
    return list[index >= 0 ? index : list.length - 1];
}

function removeActiveEffect(id){
    const list = ensureActiveEffects();
    const before = list.length;
    state.activeEffects = list.filter(e => e.id !== id);
    return state.activeEffects.length !== before;
}

function removeActiveEffectsBySource(sourceType, sourceId){
    const list = ensureActiveEffects();
    const before = list.length;
    state.activeEffects = list.filter(e => !(e.sourceType === sourceType && String(e.sourceId ?? '') === String(sourceId ?? '')));
    return state.activeEffects.length !== before;
}

function syncEquipmentActiveEffects(){
    const list = ensureActiveEffects();
    const equipmentIds = new Set();
    const register = (item, slot, index) => {
        if (!item || !item.effect) return;
        if (!item.effectId) item.effectId = `equip_${Date.now()}_${Math.floor(Math.random()*100000)}`;
        const id = `equipment:${item.effectId}`;
        equipmentIds.add(id);
        upsertActiveEffect({
            id,
            sourceType:'equipment', sourceId:item.effectId, type:'positive',
            name:item.name || 'Снаряжение', effect:item.effect,
            icon:SLOT_ICON?.[slot] || '🛡️', durationType:'permanent',
            startsAt:0, expiresAt:null,
            meta:{slot, index: Number.isFinite(index) ? index : null, rarity:item.rarity || 'common', modifiers:item.modifiers || {}}
        });
    };
    Object.entries(state.equipment || {}).forEach(([slot,item]) => register(item, slot, null));
    Object.entries(state.accessories || {}).forEach(([slot,items]) => (Array.isArray(items) ? items : []).forEach((item,index) => register(item,slot,index)));
    state.activeEffects = list.filter(e => e.sourceType !== 'equipment' || equipmentIds.has(e.id));
}

function syncLegacyEffects(){
    const list = ensureActiveEffects();
    const now = Date.now();
    const legacyIds = new Set();

    (Array.isArray(state.buffs) ? state.buffs : []).forEach(b => {
        if (!b || Number(b.expiresAt) <= now && !(b.startsAt && Number(b.startsAt) > now)) return;
        const pending = b.startsAt && now < Number(b.startsAt);
        const id = `buff:${b.id}`;
        legacyIds.add(id);
        upsertActiveEffect({
            id, sourceType:'consumable', sourceId:b.id, type:'positive',
            name:b.name || 'Расходник', effect:b.effect || 'Эффект не указан',
            icon: pending ? '⏳' : '🧪', durationType:'timed',
            startsAt:Number(b.startsAt || b.startedAt || now), expiresAt:Number(b.expiresAt),
            meta:{durationMinutes:Number(b.durationMinutes)||0, pending}
        });
    });
    (Array.isArray(state.debuffs) ? state.debuffs : []).forEach(d => {
        if (!d || Number(d.expiresAt) <= now) return;
        const id = `debuff:${d.id}`;
        legacyIds.add(id);
        upsertActiveEffect({
            id, sourceType:'debuff', sourceId:d.id, type:'negative',
            name:d.name || 'Слабость', effect:d.effect || 'Негативный эффект', icon:'⚠️',
            durationType:'timed', startsAt:Number(d.startsAt || now), expiresAt:Number(d.expiresAt),
            stack:Number(d.stack)||1,
            meta:{source:d.source || 'unknown', heroMultiplier:Number(d.heroMultiplier)||1, coinMultiplier:Number(d.coinMultiplier)||1, skillMultiplier:Number(d.skillMultiplier)||1}
        });
    });

    state.activeEffects = list.filter(e => {
        if (e.sourceType === 'consumable' || e.sourceType === 'debuff') return legacyIds.has(e.id);
        return true;
    });
    syncEquipmentActiveEffects();
    return state.activeEffects;
}

function cleanupActiveEffects(options={persist:true}){
    const now = Date.now();
    const list = ensureActiveEffects();
    const before = list.length;
    state.activeEffects = list.filter(e => e.durationType === 'permanent' || Number(e.expiresAt) > now || Number(e.startsAt) > now);
    if (before !== state.activeEffects.length && options.persist && typeof persist === 'function') persist();
    return state.activeEffects;
}

function getActiveEffects(){
    cleanupActiveEffects({persist:false});
    syncLegacyEffects();
    return ensureActiveEffects().slice().sort((a,b) => {
        const typeOrder = {negative:0, positive:1};
        const aType = typeOrder[a.type] ?? 2, bType = typeOrder[b.type] ?? 2;
        if (aType !== bType) return aType - bType;
        const aPermanent = a.durationType === 'permanent' ? 1 : 0;
        const bPermanent = b.durationType === 'permanent' ? 1 : 0;
        if (aPermanent !== bPermanent) return aPermanent - bPermanent;
        return String(a.name).localeCompare(String(b.name),'ru');
    });
}

function getActiveEffectById(id){ return getActiveEffects().find(e => e.id === id) || null; }

function getEffectModifiers(effect){
    const meta = effect?.meta && typeof effect.meta === 'object' ? effect.meta : {};
    const m = meta.modifiers && typeof meta.modifiers === 'object' ? meta.modifiers : {};
    const out = {};
    ['heroXP','coins','skillXP','powerPercent','powerFlat'].forEach(key => {
        const n = Number(m[key]);
        if (Number.isFinite(n)) out[key] = n;
    });
    if (m.skillXPBySkill && typeof m.skillXPBySkill === 'object') {
        out.skillXPBySkill = Object.fromEntries(Object.entries(m.skillXPBySkill).map(([k,v]) => [k, Number(v)]).filter(([,v]) => Number.isFinite(v)));
    }
    if (m.specialFlat && typeof m.specialFlat === 'object') {
        out.specialFlat = Object.fromEntries(Object.entries(m.specialFlat).map(([k,v]) => [k, Number(v)]).filter(([,v]) => Number.isFinite(v)));
    }
    if (m.specialPercent && typeof m.specialPercent === 'object') {
        out.specialPercent = Object.fromEntries(Object.entries(m.specialPercent).map(([k,v]) => [k, Number(v)]).filter(([,v]) => Number.isFinite(v)));
    }
    if (m.skillFlat && typeof m.skillFlat === 'object') {
        out.skillFlat = Object.fromEntries(Object.entries(m.skillFlat).map(([k,v]) => [k, Number(v)]).filter(([,v]) => Number.isFinite(v)));
    }
    if (m.skillPercent && typeof m.skillPercent === 'object') {
        out.skillPercent = Object.fromEntries(Object.entries(m.skillPercent).map(([k,v]) => [k, Number(v)]).filter(([,v]) => Number.isFinite(v)));
    }
    // Совместимость со старыми дебаффами, где модификаторы хранились прямо в meta.
    ['heroMultiplier','coinMultiplier','skillMultiplier'].forEach((legacy, i) => {
        const key = ['heroXP','coins','skillXP'][i];
        const n = Number(meta[legacy]);
        if (Number.isFinite(n) && n !== 1 && out[key] == null) out[key] = n;
    });
    return out;
}

function getActiveEffectRewardBreakdown(rewardKey='heroXP'){
    const effects = getActiveEffects();
    const result = [];
    effects.forEach(effect => {
        const m = getEffectModifiers(effect);
        const raw = Number(m?.[rewardKey]);
        if (!Number.isFinite(raw) || raw === 1 || raw === 0) return;
        const negative = effect.type === 'negative';
        let multiplier = raw;
        let percent = 0;
        if (negative) {
            multiplier = raw < 1 ? raw : (1 - raw);
            if (raw < 1) percent = (raw - 1) * 100;
            else percent = -raw * 100;
        } else {
            multiplier = raw > 0 ? raw : 1;
            percent = (raw - 1) * 100;
        }
        if (!Number.isFinite(multiplier) || multiplier <= 0 || !Number.isFinite(percent) || Math.abs(percent) < 0.01) return;
        result.push({
            id: effect.id,
            name: effect.name || 'Активный эффект',
            icon: effect.icon || '✨',
            sourceType: effect.sourceType || 'other',
            durationType: effect.durationType === 'permanent' ? 'permanent' : 'timed',
            type: negative ? 'negative' : 'positive',
            multiplier,
            percent
        });
    });
    return result;
}

function getActiveEffectRewardModifiers(){
    const effects = getActiveEffects();
    let heroPenalty = 0;
    let coinPenalty = 0;
    let skillPenalty = 0;
    let heroBonus = 1;
    let coinBonus = 1;
    let skillBonus = 1;
    const skillBonuses = {};
    effects.forEach(effect => {
        const m = getEffectModifiers(effect);
        const negative = effect.type === 'negative';
        const apply = (value, penaltyRef, bonusRef) => {
            if (!Number.isFinite(value)) return;
            if (negative && value < 1) penaltyRef.value += Math.max(0, 1 - value);
            else if (!negative && value > 0) bonusRef.value *= value;
        };
        const hp={value:heroPenalty}, cp={value:coinPenalty}, sp={value:skillPenalty};
        apply(m.heroXP, hp, {get value(){return heroBonus},set value(v){heroBonus=v}});
        apply(m.coins, cp, {get value(){return coinBonus},set value(v){coinBonus=v}});
        apply(m.skillXP, sp, {get value(){return skillBonus},set value(v){skillBonus=v}});
        heroPenalty=hp.value; coinPenalty=cp.value; skillPenalty=sp.value;
        Object.entries(m.skillXPBySkill || {}).forEach(([skill,v]) => {
            if (!Number.isFinite(v)) return;
            if (negative && v < 1) skillBonuses[skill] = (skillBonuses[skill] ?? 1) - (1-v);
            else if (!negative && v > 0) skillBonuses[skill] = (skillBonuses[skill] ?? 1) * v;
        });
    });
    return {
        heroXP: Math.max(0.05, Math.min(2, heroBonus * Math.max(0.05, 1-heroPenalty))),
        coins: Math.max(0.05, Math.min(2, coinBonus * Math.max(0.05, 1-coinPenalty))),
        skillXP: Math.max(0.05, Math.min(2, skillBonus * Math.max(0.05, 1-skillPenalty))),
        skillXPBySkill: skillBonuses
    };
}

function getActiveEffectStatModifiers(){
    const result = {specialFlat:{}, specialPercent:{}, skillFlat:{}, skillPercent:{}};
    getActiveEffects().forEach(effect => {
        const m = getEffectModifiers(effect);
        const sign = effect.type === 'negative' ? -1 : 1;
        Object.entries(m.specialFlat || {}).forEach(([key,value]) => {
            if (!Number.isFinite(value)) return;
            result.specialFlat[key] = (result.specialFlat[key] || 0) + sign * value;
        });
        Object.entries(m.specialPercent || {}).forEach(([key,value]) => {
            if (!Number.isFinite(value)) return;
            const delta = Math.abs(value) > 1 ? Math.abs(value) / 100 : Math.abs(value);
            const factor = sign < 0 ? Math.max(0, 1 - delta) : 1 + delta;
            result.specialPercent[key] = (result.specialPercent[key] || 1) * factor;
        });
        Object.entries(m.skillFlat || {}).forEach(([key,value]) => {
            if (!Number.isFinite(value)) return;
            result.skillFlat[key] = (result.skillFlat[key] || 0) + sign * value;
        });
        Object.entries(m.skillPercent || {}).forEach(([key,value]) => {
            if (!Number.isFinite(value)) return;
            const delta = Math.abs(value) > 1 ? Math.abs(value) / 100 : Math.abs(value);
            const factor = sign < 0 ? Math.max(0, 1 - delta) : 1 + delta;
            result.skillPercent[key] = (result.skillPercent[key] || 1) * factor;
        });
    });
    return result;
}

function getEffectiveSpecialValue(key){
    const base = Number(state?.special?.[key]);
    const modifiers = getActiveEffectStatModifiers();
    const flat = Number(modifiers.specialFlat?.[key]) || 0;
    const percent = Number(modifiers.specialPercent?.[key]);
    const factor = Number.isFinite(percent) && percent > 0 ? percent : 1;
    return Math.max(0, Math.round((Number.isFinite(base) ? base : 0) * factor + flat));
}

function getActiveEffectSkillXPMultiplier(skillName){
    const modifiers = getActiveEffectStatModifiers();
    const factor = Number(modifiers.skillPercent?.[skillName]);
    return Number.isFinite(factor) && factor > 0 ? factor : 1;
}

function getEffectiveSkillLevel(skillName){
    const baseXP = Number(state?.skills?.[skillName]) || 0;
    const baseLevel = typeof getSkillLevel === 'function' ? getSkillLevel(baseXP) : 0;
    const modifiers = getActiveEffectStatModifiers();
    const flat = Number(modifiers.skillFlat?.[skillName]) || 0;
    return Math.max(0, Math.round(baseLevel + flat));
}

function updateActiveBuffsHeader(){
    const buffsEl = document.getElementById('activeBuffs');
    const now = Date.now();
    if (!Array.isArray(state.debuffs)) state.debuffs = [];
    state.debuffs = state.debuffs.filter(d => Number(d.expiresAt) > now);
    if (!Array.isArray(state.buffs)) state.buffs = [];
    state.buffs = state.buffs.filter(b => Number(b.expiresAt) > now || (b.startsAt && Number(b.startsAt) > now));
    const effects = getActiveEffects().filter(e => e.durationType !== 'permanent');
    if (activeBuffExpandedId && !effects.some(e => e.id === activeBuffExpandedId)) activeBuffExpandedId = null;
    if (!buffsEl) {
        if (typeof renderProfileBuffs === 'function') renderProfileBuffs();
        return;
    }
    buffsEl.innerHTML = effects.map(e => {
        const pending = Number(e.startsAt) > now;
        const remaining = pending ? Number(e.startsAt) - now : (e.durationType === 'permanent' ? null : Number(e.expiresAt) - now);
        const isExpanded = activeBuffExpandedId === e.id;
        const status = e.type === 'negative' ? 'debuff-chip' : '';
        const timeLabel = e.durationType === 'permanent' ? 'постоянно' : (pending ? `через ${formatBuffDuration(remaining)}` : formatBuffDuration(remaining));
        return `<div class="active-buff-wrap ${isExpanded ? 'expanded' : ''}">
            <button type="button" class="active-buff-chip ${status}" data-buff-toggle="${escapeHtml(e.id)}" aria-expanded="${isExpanded ? 'true' : 'false'}">
                <span class="active-buff-effect">${escapeHtml(e.icon)} ${escapeHtml(e.effect || e.name)}</span>
                <span class="active-buff-time">${escapeHtml(timeLabel)}</span>
            </button>
            ${isExpanded ? `<div class="active-buff-detail">
                <div class="active-buff-detail-name">${escapeHtml(e.name)}</div>
                <div class="active-buff-detail-effect">${escapeHtml(e.effect || 'Эффект не указан')}</div>
                <div class="active-buff-detail-time">${e.durationType === 'permanent' ? '♾️ Постоянный эффект' : `⏱ ${pending ? 'До активации' : 'Осталось'}: ${formatBuffDuration(remaining)}`}</div>
                <div class="active-buff-detail-source">Источник: ${escapeHtml(getActiveEffectSourceLabel(e))}</div>
            </div>` : ''}
        </div>`;
    }).join('');
    buffsEl.querySelectorAll('[data-buff-toggle]').forEach(btn => btn.addEventListener('click', () => {
        activeBuffExpandedId = activeBuffExpandedId === btn.dataset.buffToggle ? null : btn.dataset.buffToggle;
        updateActiveBuffsHeader();
    }));
    if (typeof renderProfileBuffs === 'function') renderProfileBuffs();
}

function getActiveEffectSourceLabel(effect){
    const labels = {consumable:'Расходник', equipment:'Снаряжение', debuff:'Дебафф', perk:'Перек', quest:'Квест', system:'Система'};
    return labels[effect?.sourceType] || 'Другой источник';
}
