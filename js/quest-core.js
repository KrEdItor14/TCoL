"use strict";


/* Quest Core — game rules/state mutations only. No DOM, no render(), no persist(). */
const DIFFICULTY_TABLE = {
  trivial: { base: 15, mult: 1.0, label:"⚪ новичок" },
  easy:    { base: 30, mult: 1.15, label:"🟢 ученик" },
  normal:  { base: 55, mult: 1.35, label:"🔵 адепт" },
  hard:    { base: 110, mult: 1.7, label:"🟣 эксперт" },
  epic:    { base: 260, mult: 2.3, label:"🟡 мастер" },
};

const DIFFICULTY_KEYS = ['trivial','easy','normal','hard','epic'];
function safeDifficulty(d){ return DIFFICULTY_KEYS.includes(d) ? d : 'normal'; }
function diffMeta(key){ return DIFFICULTY_TABLE[key] || DIFFICULTY_TABLE.normal; }

function descriptionBonus(desc){
  const len = (desc || "").trim().length;
  return Math.min(DESC_XP_CAP, Math.round(len * DESC_XP_PER_CHAR));
}

function computeQuestReward(difficultyKey, minutes, steps, skillKeys, desc){
  const tier = DIFFICULTY_TABLE[difficultyKey] || DIFFICULTY_TABLE.normal;
  const stepFactor = 1 + Math.max(0, (steps||1) - 1) * STEP_BONUS;
  const descBonus = descriptionBonus(desc);
  let heroXP = (tier.base + minutes * XP_PER_MINUTE + descBonus) * tier.mult * stepFactor;
  heroXP = Math.max(5, Math.round(heroXP / 5) * 5);
  const coins = Math.max(5, Math.round(heroXP * COIN_RATIO / 5) * 5);
  const pool = Math.round(heroXP * SKILL_POOL_RATIO);
  const skills = {};
  if(skillKeys && skillKeys.length){
    const each = Math.max(1, Math.round(pool / skillKeys.length));
    skillKeys.forEach(k=> skills[k] = each);
  }
  return { heroXP, coins, skills, descBonus };
}

function sumQuestRewards(...rewards){
  const out = { heroXP:0, coins:0, skills:{} };
  rewards.forEach(r=>{
    if(!r) return;
    out.heroXP += Number(r.heroXP) || 0;
    out.coins += Number(r.coins) || 0;
    Object.entries(r.skills||{}).forEach(([k,v])=>{
      out.skills[k] = (out.skills[k]||0) + (Number(v)||0);
    });
  });
  return out;
}

function raidReward(reward){
  if(!reward) return reward;
  const clone = { ...reward };
  clone.heroXP = Math.max(5, Math.round((Number(reward.heroXP)||0) * RAID_REWARD_MULTIPLIER));
  clone.coins = Math.max(5, Math.round((Number(reward.coins)||0) * RAID_REWARD_MULTIPLIER));
  if (reward.skills) clone.skills = Object.fromEntries(Object.entries(reward.skills).map(([k,v]) => [k, Math.max(1, Math.round((Number(v)||0) * RAID_REWARD_MULTIPLIER))]));
  return clone;
}

function getQuestCancelDebuffDurationMs(difficulty){
  const hours = QUEST_CANCEL_DEBUFF_BY_DIFFICULTY[safeDifficulty(difficulty)] || 3;
  return hours * 60 * 60 * 1000;
}

function applyQuestCancelDebuff(q){
  const now = Date.now();
  if (!Array.isArray(S().debuffs)) S().debuffs = [];
  const active = S().debuffs.find(d => d.source === 'quest-cancel' && Number(d.expiresAt) > now);
  if (!active) {
    const expiresAt = now + getQuestCancelDebuffDurationMs(q.difficulty);
    const hours = QUEST_CANCEL_DEBUFF_BY_DIFFICULTY[safeDifficulty(q.difficulty)] || 3;
    return addDebuff({ id:'quest-cancel-weakness', source:'quest-cancel', name:'Слабость', stack:1, startsAt:now, expiresAt, heroMultiplier:1-QUEST_CANCEL_DEBUFF_PERCENT/100, coinMultiplier:1, skillMultiplier:1, effect:`−${QUEST_CANCEL_DEBUFF_PERCENT}% XP героя · ${hours}ч` });
  }
  active.stack = Math.max(1, Number(active.stack)||1) + 1;
  if (active.stack >= QUEST_CANCEL_EXHAUSTION_AFTER) {
    active.name = 'Изнеможение';
    active.effect = '−75% XP героя · −75% монет · −75% XP навыков';
    active.heroMultiplier = 0.25;
    active.coinMultiplier = 0.25;
    active.skillMultiplier = 0.25;
  } else {
    const pct = active.stack * QUEST_CANCEL_DEBUFF_PERCENT;
    active.name = 'Слабость';
    active.effect = `−${pct}% XP героя`;
    active.heroMultiplier = 1 - pct/100;
  }
  return active;
}

function applyRaidCancelDebuff(raid){
  const now = Date.now();
  const durationMs = Math.max(1, Math.round((Number(raid.estMinutes)||0) * 60 * 1000 * RAID_CANCEL_DURATION_RATIO));
  return addDebuff({ id:'raid-cancel-weakness', source:'raid-cancel', name:'Слабость', stack:1, startsAt:now, expiresAt:now+durationMs, heroMultiplier:RAID_CANCEL_XP_MULTIPLIER, coinMultiplier:1, skillMultiplier:1, effect:'−50% XP героя' });
}

function createQuest(data) {
  if (!data || typeof data !== 'object') return { ok:false, reason:'invalid_quest' };
  // Planned list is reserved for unstarted raids only.
  if (data.type !== 'рейд') return { ok:false, reason:'planned_raids_only' };
  if (!Array.isArray(S().quests.planned)) S().quests.planned = [];
  const q = { ...data };
  q.id = q.id || S().nextQuestId++;
  q.type = 'рейд';
  S().quests.planned.push(q);
  return { ok:true, quest:q };
}

function startNewQuest(q) {
  if (!q || typeof q !== 'object') return { ok:false, reason:'invalid_quest' };
  if (!Array.isArray(S().quests.active)) S().quests.active = [];
  // Raids must be planned first, then started from the planned list.
  if (q.type === 'рейд') return { ok:false, reason:'raid_must_be_planned' };
  S().quests.active.push(q);
  return { ok:true, quest:q };
}

function isRaidTimeExpired(q = null) {
  if (!S().raidActive || !S().raidStartTime) return false;
  const totalMs = Math.max(0, Number(S().raidTotalMinutes || 0) * 60000);
  if (totalMs <= 0) return false;
  if (q && q.type !== 'рейд') return false;
  return Date.now() >= S().raidStartTime + totalMs;
}

function failExpiredRaid(index) {
  const q = S().quests.active[index];
  if (!q || q.type !== 'рейд') return null;
  S().raidActive = false;
  S().raidStartTime = null;
  S().raidTotalMinutes = 0;
  S().quests.active.splice(index, 1);
  S().quests.stats.failed++;
  return { failed:true, q };
}

const QuestCore = Object.freeze({
  createQuest,
  startNewQuest,
  isRaidTimeExpired,
  failExpiredRaid,
  startPlannedQuest(index){
    const item = S().quests.planned[index];
    if(!item) return null;
    if(item.type === "рейд" && S().raidActive) return { blocked:true, reason:"raid-active" };
    if(item.type === "рейд" && (!Number(item.estMinutes) || Number(item.estMinutes) > RAID_MAX_MINUTES)) return { blocked:true, reason:"raid-too-long" };
    S().quests.planned.splice(index, 1);
    if(item.type === "рейд") item.reward = raidReward(item.reward);
    S().quests.active.push(item);
    if(item.type === "рейд"){
      S().raidActive = true;
      S().raidStartTime = Date.now();
      S().raidTotalMinutes = item.estMinutes || 0;
    }
    return item;
  },

  advanceStep(index){
    const q = S().quests.active[index];
    if(!q || !q.total) return null;
    q.progress = Math.min(q.total, (q.progress || 0) + 1);
    return q;
  },

  completeQuest(index, withBonus){
    const q = S().quests.active[index];
    if(!q) return null;
    if(S().raidActive && q.type !== "рейд") return { blocked:true, reason:"raid-active" };
    // Active raids cannot be completed early — only after the timer expires.
    if(q.type === "рейд" && isRaidTimeExpired(q) === false) {
      return { blocked:true, reason:"raid-in-progress" };
    }
    // Expired raids are confirmed manually: success (this method) or failure (failExpiredRaid).

    const levelBefore = S().character.level;
    const bonusReward = withBonus ? (q.bonus || null) : null;
    const combined = sumQuestRewards(q.reward, bonusReward);
    const mods = getRewardMultipliers();
    const effectiveCombined = {
      heroXP: Math.max(0, Math.round(combined.heroXP * mods.heroXP)),
      coins: Math.max(0, Math.round(combined.coins * mods.coins)),
      skills: Object.fromEntries(Object.entries(combined.skills || {}).map(([k,v]) => [k, Math.max(0, Math.round((Number(v)||0) * mods.skillXP))]))
    };
    const trackedSkills = Object.keys(combined.skills || {});
    const skillBefore = {};
    trackedSkills.forEach(skill => {
      const xp = Number(S().skills[skill] || 0);
      skillBefore[skill] = { xp, level: getSkillLevel(xp) };
    });
    // Фиксируем фактически начисленный XP сразу после каждого применения награды.
    // Это надёжнее, чем пытаться восстановить его позже из S().skills: баннер
    // должен показывать именно ту величину, которую вернул addSkillXP().
    // Получаем фактически начисленный XP напрямую из addSkillXP(),
    // а не восстанавливаем его через разницу S().skills.
    // Это исключает ситуацию, когда баннер получает одинаковые before/after.
    const skillApplied = {};
    const mainTracking = { skills: {} };
    const itemsFromMain = applyReward(q.reward, q.title, mainTracking) || [];
    Object.entries(mainTracking.skills).forEach(([skill, xp]) => {
      skillApplied[skill] = (skillApplied[skill] || 0) + Math.max(0, Number(xp) || 0);
    });
    addTodayQuest();
    if (bonusReward) {
      const bonusTracking = { skills: {} };
      const itemsFromBonus = applyReward(bonusReward, q.title + " (бонус)", bonusTracking) || [];
      Object.entries(bonusTracking.skills).forEach(([skill, xp]) => {
        skillApplied[skill] = (skillApplied[skill] || 0) + Math.max(0, Number(xp) || 0);
      });
      var _itemsFromBonus = itemsFromBonus;
    } else {
      var _itemsFromBonus = [];
    }
    const leveledUp = S().character.level > levelBefore;
    const skillChanges = trackedSkills.map(skill => {
      const before = skillBefore[skill] || { xp: 0, level: 0 };
      const appliedXP = Math.max(0, Number(skillApplied[skill] || 0));
      const afterXP = before.xp + appliedXP;
      const afterLevel = getSkillLevel(afterXP);
      return {
        skill,
        beforeXP: before.xp,
        afterXP,
        appliedXP,
        beforeLevel: before.level,
        afterLevel
      };
    });
    const droppedItems = [...itemsFromMain, ..._itemsFromBonus];

    if(q.type === "рейд"){
      S().raidActive = false;
      S().raidStartTime = null;
      S().raidTotalMinutes = 0;
    }

    S().quests.active.splice(index, 1);
    S().quests.completed.push({id:q.id, icon:q.icon, title:q.title});
    if(S().quests.completed.length > QUEST_COMPLETED_MAX){
      S().quests.completed.splice(0, S().quests.completed.length - QUEST_COMPLETED_MAX);
    }
    S().quests.stats.completed++;
    const events = [
      { type:'quest', icon:'⚔️', text:`Выполнен квест: ${q.title}` }
    ];
    if(effectiveCombined.coins) events.push({ type:'coins', icon:'💰', text:`Получено монет: +${effectiveCombined.coins}` });
    if(effectiveCombined.heroXP) events.push({ type:'xp', icon:'⭐', text:`Получено XP: +${effectiveCombined.heroXP}` });

    return { q, combined: effectiveCombined, baseReward: combined, droppedItems, leveledUp, skillChanges, events, rewardMultipliers: mods };
  },

  abortQuest(index, isRaid){
    const q = S().quests.active[index];
    if(!q) return null;

    let debuff = null;
    if(isRaid){
      debuff = applyRaidCancelDebuff(q);
    } else {
      debuff = applyQuestCancelDebuff(q);
    }
    S().quests.active.splice(index,1);
    S().quests.stats.aborted++;

    if(q.type === "рейд"){
      S().raidActive = false;
      S().raidStartTime = null;
      S().raidTotalMinutes = 0;
    }
    return { q, debuff, isRaid: !!isRaid };
  }
});
