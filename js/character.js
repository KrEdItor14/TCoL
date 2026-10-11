"use strict";

function getTodayDate() {
return new Date().toDateString();
}

function resetTodayStatsIfNeeded() {
const today = getTodayDate();
if (state.todayStats.date !== today) {
state.todayStats = { quests: 0, coins: 0, xp: 0, activitySeconds: 0, date: today };
}
}

function addTodayQuest() {
resetTodayStatsIfNeeded();
state.todayStats.quests++;
}

function addTodayCoins(amount) {
resetTodayStatsIfNeeded();
state.todayStats.coins += amount;
}

function addTodayXP(amount) {
resetTodayStatsIfNeeded();
state.todayStats.xp += amount;
}

function fmt(n){ return Number(n).toLocaleString("ru-RU"); }

function addSkillXP(skillName, xp){
if(!xp) return 0;
if(!(skillName in state.skills)) state.skills[skillName] = 0;
const baseXP = Number(xp) || 0;
const specialMultiplier = typeof getSkillMultiplier === 'function' ? getSkillMultiplier(skillName) : 1;
const effectMultiplier = typeof getActiveEffectSkillXPMultiplier === 'function'
    ? getActiveEffectSkillXPMultiplier(skillName)
    : 1;
const finalXP = Math.max(0, Math.round(baseXP * specialMultiplier * effectMultiplier));
state.skills[skillName] += finalXP;
if (typeof syncAchievements === 'function') syncAchievements();
return finalXP;
}


function cleanupDebuffs(){
    if (!Array.isArray(state.debuffs)) state.debuffs = [];
    const now = Date.now();
    const before = state.debuffs.length;
    state.debuffs = state.debuffs.filter(d => Number(d.expiresAt) > now);
    if (state.debuffs.length !== before && typeof persist === 'function') persist();
    return state.debuffs;
}

function getRewardMultipliers(){
    if (typeof getActiveEffectRewardModifiers === 'function') return getActiveEffectRewardModifiers();
    cleanupDebuffs();
    const active = state.debuffs || [];
    return {
        heroXP: active.reduce((m,d) => Math.min(m, Number.isFinite(Number(d.heroMultiplier)) ? Number(d.heroMultiplier) : 1), 1),
        coins: active.reduce((m,d) => Math.min(m, Number.isFinite(Number(d.coinMultiplier)) ? Number(d.coinMultiplier) : 1), 1),
        skillXP: active.reduce((m,d) => Math.min(m, Number.isFinite(Number(d.skillMultiplier)) ? Number(d.skillMultiplier) : 1), 1),
        skillXPBySkill: {}
    };
}

function addDebuff(debuff){
    if (!debuff || !debuff.expiresAt) return null;
    if (!Array.isArray(state.debuffs)) state.debuffs = [];
    const existing = state.debuffs.find(d => d.id === debuff.id && Number(d.expiresAt) > Date.now());
    const result = existing ? Object.assign(existing, debuff) : (state.debuffs.push({...debuff}), state.debuffs[state.debuffs.length - 1]);
    if (typeof upsertActiveEffect === 'function') upsertActiveEffect({
        id:`debuff:${result.id}`, sourceType:'debuff', sourceId:result.id, type:'negative',
        name:result.name || 'Слабость', effect:result.effect || '', icon:'⚠️', durationType:'timed',
        startsAt:Number(result.startsAt) || Date.now(), expiresAt:Number(result.expiresAt), stack:Number(result.stack)||1,
        meta:{source:result.source || 'unknown', heroMultiplier:Number(result.heroMultiplier)||1, coinMultiplier:Number(result.coinMultiplier)||1, skillMultiplier:Number(result.skillMultiplier)||1}
    });
    return result;
}

function addHeroXP(xp){
if(!xp) return;
const levelBefore = Number(state.character.level) || 0;
const powerBefore = typeof getProfilePower === 'function' ? getProfilePower() : 0;
state.character.heroXP += xp;
addTodayXP(xp);
let threshold = levelThreshold(state.character.level);
while(state.character.heroXP >= threshold){
state.character.heroXP -= threshold;
state.character.level += 1;
state.character.perkPoints += 1;
state.character.specialPoints += 1;
if (typeof PerksCore !== "undefined") PerksCore.resetGenerationForLevel(state.character.level);
state.character.craftGenLevel = state.character.level;
state.character.craftGenCount = 0;
if (state.character.level === 5) {
toast(`⭐ Новый уровень: 5! 🎒 Инвентарь и 🛠️ Крафт разблокированы!`);
} else {
toast(`⭐ Новый уровень: ${state.character.level}!`);
}
logEvent('level', '⬆️', `Новый уровень: ${state.character.level}`);
if (typeof syncAchievements === 'function') syncAchievements();
threshold = levelThreshold(state.character.level);
}
if (state.character.level > levelBefore) {
  const powerAfter = typeof getProfilePower === 'function' ? getProfilePower() : powerBefore;
  pendingLevelUpData = {
    fromLevel: levelBefore,
    toLevel: Number(state.character.level) || levelBefore,
    fromPower: Number(powerBefore) || 0,
    toPower: Number(powerAfter) || 0,
    duration: 2000
  };
  pendingLevelUpEffect = false;
}
}

function addCoins(delta, label){
const safeDelta = Number(delta);
if (!Number.isFinite(safeDelta)) return 0;
state.character.coins = Math.max(0, Math.trunc(Number(state.character.coins) || 0) + Math.trunc(safeDelta));
delta = Math.trunc(safeDelta);
if (delta > 0 && typeof registerCoinsEarned === 'function') registerCoinsEarned(delta);
addTodayCoins(delta);
state.coinLog.push({label, delta, running: state.character.coins});
if(state.coinLog.length > 40) state.coinLog.shift();
}

function applyReward(reward, sourceLabel, tracking){
const itemsAdded = [];
if(!reward) return itemsAdded;
const mods = getRewardMultipliers();
const finalHeroXP = reward.heroXP ? Math.max(0, Math.round(Number(reward.heroXP) * mods.heroXP)) : 0;
const finalCoins = reward.coins ? Math.max(0, Math.round(Number(reward.coins) * mods.coins)) : 0;
if(finalHeroXP) addHeroXP(finalHeroXP);
if(finalCoins) addCoins(finalCoins, sourceLabel);
if(reward.skills){
Object.entries(reward.skills).forEach(([k,v]) => {
  const finalSkillBase = Math.max(0, Math.round((Number(v) || 0) * mods.skillXP));
const oldLevel = getSkillLevel(state.skills[k] || 0);
const appliedSkillXP = addSkillXP(k, finalSkillBase);
if (tracking && tracking.skills) {
  tracking.skills[k] = (tracking.skills[k] || 0) + appliedSkillXP;
}
const newLevel = getSkillLevel(state.skills[k] || 0);
if (appliedSkillXP !== Number(finalSkillBase)) {
  const mult = typeof getSkillMultiplier === 'function' ? getSkillMultiplier(k) : 1;
  toast(`✨ ${k}: +${appliedSkillXP} XP (база ${Number(v)} · дебафф ${Math.round(mods.skillXP*100)}% · ${formatSkillMultiplier(mult)})`);
}
if(newLevel > oldLevel) {
toast(`⬆️ Навык "${k}" достиг ${newLevel} уровня!`);
logEvent('skill', '📈', `Навык «${k}» достиг ${newLevel} уровня`);
}
});
}
if(reward.items && Array.isArray(reward.items)){
    reward.items.forEach(it => {
      const added = addInventoryItem({...it, source: sourceLabel});
      itemsAdded.push(added);
      logEvent('item', '🎒', `Получен предмет: ${added.name}`);
    });
    }
if(reward.unlocks){
reward.unlocks.forEach(u=> { if(u in state.unlocks) state.unlocks[u] = true; });
}
return itemsAdded;
}
