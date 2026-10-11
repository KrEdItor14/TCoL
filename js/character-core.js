"use strict";


// Character Core: character/state transitions only. No DOM, rendering or persistence.
const CharacterCore = (() => {
  function setName(name) {
    const value = String(name ?? '').trim();
    if (!value || value.length > 24) return { ok:false, reason:'invalid_name' };
    S().character.name = value;
    return { ok:true, name:value };
  }

  function spendSpecialPoint(key) {
    if (!key || !(key in S().special)) return { ok:false, reason:'invalid_attribute' };
    if ((Number(S().character.specialPoints) || 0) <= 0) return { ok:false, reason:'no_points' };
    S().special[key] = (Number(S().special[key]) || 0) + 1;
    S().character.specialPoints -= 1;
    if (typeof registerAttributeUpgrade === 'function') registerAttributeUpgrade();
    return { ok:true, key, value:S().special[key], remainingPoints:S().character.specialPoints };
  }

  function addActivitySeconds(seconds) {
    const amount = Math.max(0, Math.floor(Number(seconds) || 0));
    if (!amount) return { ok:false, amount:0 };
    resetTodayStatsIfNeeded();
    S().todayStats.activitySeconds = (Number(S().todayStats.activitySeconds) || 0) + amount;
    S().totalActivitySeconds = (Number(S().totalActivitySeconds) || 0) + amount;
    if (typeof syncAchievements === 'function') syncAchievements();
    return { ok:true, amount };
  }

  return Object.freeze({ setName, spendSpecialPoint, addActivitySeconds });
})();
