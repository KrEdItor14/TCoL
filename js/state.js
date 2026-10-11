"use strict";

let state = null;

// Shared UI caches/state used by multiple modules. Keep these near the global state
// so module order does not determine whether they exist at runtime.
let expandedItems = {};
const bossBarCache = {};

let raidTimerInterval = null;

let autosaveTimeout = null;
let autosaveNextAt = Date.now() + AUTOSAVE_INTERVAL;

// True when in-memory state has changed since the last successful save.
let stateDirty = false;

let aiAvailable = false;

let pendingQuestItems = [];
let pendingQuestGeneratedByAI = false;

let pendingLevelUpEffect = false;
let pendingLevelUpData = null;

function levelThreshold(level){ return 75 + level*25; }

function isInventoryUnlocked(){
return true;
}

function isCraftUnlocked(){
return true;
}

function skillLevelCost(level){ return 75 + level * 25; }

// Cumulative XP required to reach the given skill level:
// Lv1 = 100, Lv2 = 225, Lv3 = 375, Lv4 = 550...
function skillLevelThreshold(level){
if (level <= 0) return 0;
let total = 0;
for (let i = 1; i <= level; i++) total += skillLevelCost(i);
return total;
}

function skillLevelFloor(level){ return level <= 0 ? 0 : skillLevelThreshold(level); }

function getSkillLevel(xp){
let level = 0;
let threshold = skillLevelThreshold(1);
while(xp >= threshold){
level++;
threshold = skillLevelThreshold(level + 1);
}
return level;
}
