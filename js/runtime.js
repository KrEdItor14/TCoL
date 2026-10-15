/* Generated runtime bundle for The Credo of Life v3.5.0 */
/* Rebuilt from source modules by build-runtime.bat. */

/* ===== data\constants.js ===== */
"use strict";

const APP_VERSION = "3.7.4";

const STORAGE_KEY = "tcol-save";

const AUTOSAVE_INTERVAL = 60000;

// Keep only the recent completed-quest history in the save.
// Lifetime totals live in state.quests.stats.
const QUEST_COMPLETED_MAX = 200;

// Quest reward balancing constants
const XP_PER_MINUTE = 0.22;
const COIN_RATIO = 0.55;
const SKILL_POOL_RATIO = 0.65;
const DESC_XP_PER_CHAR = 0.12;
const DESC_XP_CAP = 45;

// Raid / cancellation penalty rules
const RAID_MAX_MINUTES = 24 * 60;
const RAID_REWARD_MULTIPLIER = 3;
const QUEST_CANCEL_DEBUFF_BY_DIFFICULTY = { trivial: 1, easy: 2, normal: 3, hard: 4, epic: 5 };
const QUEST_CANCEL_DEBUFF_PERCENT = 5;
const QUEST_CANCEL_EXHAUSTION_AFTER = 4;
const RAID_CANCEL_XP_MULTIPLIER = 0.50;
const RAID_CANCEL_DURATION_RATIO = 0.25;

const TABS = [
    {id:"char", label:"🏠 ГЛАВНАЯ"},
    {id:"quests", label:"📜 КВЕСТЫ"},
    {id:"skills", label:"🌳 РАЗВИТИЕ"},
    {id:"perks", label:"⭐ ПЕРКИ"},
    {id:"boss", label:"👹 БОССЫ"},
    {id:"inventory", label:"🎒 ИНВЕНТАРЬ"},
    {id:"gear", label:"👕 ЭКИПИРОВКА"},
    {id:"craft", label:"🛠️ КРАФТ"},
    {id:"economy", label:"🏪 МАГАЗИН"},
    {id:"ach", label:"🏆 ДОСТИЖЕНИЯ"},
    {id:"profile", label:"👤 ПРОФИЛЬ"},
    {id:"journal", label:"📖 ЖУРНАЛ"},
    {id:"settings", label:"⚙️ НАСТРОЙКИ"},
    {id:"settings-ai", label:"🤖 AI"},
    ];

const EQUIP_SLOTS = ['Голова', 'Тело', 'Тело верхняя', 'Перчатки', 'Ноги', 'Ступни', 'Обувь', 'Рюкзак'];

const ACCESSORY_SLOTS = ['Запястье (левое)', 'Запястье (правое)', 'Пальцы', 'Шея', 'Гаджет'];

const ALL_SLOTS = [...EQUIP_SLOTS, ...ACCESSORY_SLOTS];

const SLOT_ORDER = ALL_SLOTS; // сохранено для обратной совместимости с местами, где используется общий список слотов

const SLOT_ICON = {
'Голова':'🧢', 'Тело':'👕', 'Тело верхняя':'🧥', 'Перчатки':'🧤', 'Ноги':'👖', 'Ступни':'🧦', 'Обувь':'👟', 'Рюкзак':'🎒',
'Запястье (левое)':'⌚', 'Запястье (правое)':'⌚', 'Пальцы':'💍', 'Шея':'📿', 'Гаджет':'📱'
};

const SLOT_MAP_OLD_TO_NEW = {
'Голова':'Голова', 'Шея':'Шея', 'Торс':'Тело', 'Туловище':'Тело',
'Руки':'Запястье (левое)', 'Запястье':'Запястье (левое)',
'Пояс':'Пальцы', 'Аксессуар':'Пальцы', 'Палец':'Пальцы',
'Аксессуар I':'Пальцы', 'Аксессуар II':'Шея',
'Ноги':'Ноги', 'Ступни':'Ступни', 'Гаджет':'Гаджет'
};


// Power system v3.4.40
const POWER_SPECIAL_PER_POINT = 10;
const POWER_SKILL_PER_LEVEL = 8;
const POWER_CHARACTER_LEVEL = 10;

const EQUIPMENT_POWER_BY_RARITY = { common:5, uncommon:10, rare:25, epic:40, legendary:65, unique:80, mythical:100 };
const EQUIPMENT_CONDITION_MULTIPLIER = {
    broken:0.50, damaged:0.65, worn:0.80, good:1.00, reliable:1.05, excellent:1.10, perfect:1.20
};
const EQUIPMENT_CONDITION_LABEL = {
    broken:'Сломанное', damaged:'Повреждённое', worn:'Потрёпанное', good:'Хорошее', reliable:'Надёжное', excellent:'Отличное', perfect:'Идеальное'
};
const CONDITION_LABEL = EQUIPMENT_CONDITION_LABEL;
const CONDITION_ICON = { broken:'🔴', damaged:'🟠', worn:'🟡', good:'🟢', reliable:'🔵', excellent:'🔷', perfect:'🟣' };
const EQUIPMENT_CONDITION_ALIASES = { bad:'worn', poor:'damaged', broken:'broken', damaged:'damaged', worn:'worn', good:'good', reliable:'reliable', excellent:'excellent', perfect:'perfect' };

function getEquipmentConditionMultiplier(condition){
    return EQUIPMENT_CONDITION_MULTIPLIER[condition] || EQUIPMENT_CONDITION_MULTIPLIER.good;
}
function getEquipmentSlotMultiplier(slot){
    return isAccessorySlot(slot) ? 0.90 : 1.00;
}
function getEquipmentLevel(item){
    const n = Number(item?.itemLevel ?? item?.level);
    const fallback = Number(state?.character?.level) || 1;
    return Math.max(1, Math.floor(Number.isFinite(n) && n > 0 ? n : fallback));
}
function getEquipmentLevelMultiplier(item){
    return 1 + (getEquipmentLevel(item) - 1) * 0.10;
}


const THEMES = [
{ id:'nature', label:'Природа', dots:['#050e08','#6dffa0','#ffd166'] },
{ id:'dark', label:'Тёмная', dots:['#0d0d10','#e2e2e8','#ffb84d'] },
{ id:'light', label:'Светлая', dots:['#f3f5ef','#1f2a1a','#a8631a'] },
{ id:'space', label:'Космос', dots:['#0a0a1f','#c0abff','#ffd166'] },
];

const SKILLS_DATA = [
    { name: "🛠️ Ручной труд", desc: "Физическая работа, ремонт, сборка, строительство" },
    { name: "⚡ Продуктивность", desc: "Эффективность, скорость выполнения задач" },
    { name: "💰 Финансы", desc: "Управление деньгами, бюджет, планирование трат" },
    { name: "💻 Технологии", desc: "Работа с техникой, софтом, гаджетами" },
    { name: "🧘 Концентрация", desc: "Фокус, внимание, работа без отвлечений" },
    { name: "💪 Физическая форма", desc: "Общее физическое состояние, зарядка, тонус" },
    { name: "🏋️ Выносливость", desc: "Способность выдерживать длительные нагрузки" },
    { name: "🔍 Анализ", desc: "Логика, разбор ситуаций, поиск решений" },
    { name: "📋 Менеджмент", desc: "Управление проектами, делами, ресурсами" },
    { name: "👑 Лидерство", desc: "Умение вести за собой, мотивация" },
    { name: "🧭 Выживание", desc: "Практические навыки выживания, адаптация и подготовка" },
    { name: "🗣️ Коммуникация", desc: "Общение, командная работа, контакты" },
    { name: "🎯 Ответственность", desc: "Дисциплина, доведение дел до конца" },
    { name: "🎨 Творчество", desc: "Создание идей, нестандартные решения и самовыражение" },
];

const SKILL_NAMES = SKILLS_DATA.map(s => s.name);

function isAccessorySlot(slot){ return ACCESSORY_SLOTS.includes(slot); }

function rollConsumableRarity(){
    const roll = Math.random() * 100;
    let acc = 0;
    for (const [rarity, weight] of CONSUMABLE_RARITY_WEIGHTS){
        acc += weight;
        if (roll < acc) return rarity;
    }
    return 'common';
}

function normalizeConsumableDuration(value, fallback=30){
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(1440, Math.max(15, n)) : fallback;
}

/* ===== data\rarities.js ===== */
"use strict";



const RARITY_ORDER = ['common','uncommon','rare','epic','legendary','unique','mythical'];

const RARITY_LABEL = { common:'Обычная', uncommon:'Необычная', rare:'Редкая', epic:'Эпическая', legendary:'Легендарная', unique:'Уникальная', mythical:'Мифическая' };

const CONSUMABLE_RARITY_WEIGHTS = [
    ['common', 60], ['uncommon', 25], ['rare', 10], ['epic', 4],
    ['legendary', 0.9], ['unique', 0.09], ['mythical', 0.01]
];

/* ===== js\state.js ===== */
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

/* ===== js\game-state.js ===== */
"use strict";

/**
 * Game State boundary.
 *
 * Stage 2.2: the game state now has one explicit owner/API. Existing systems
 * still use the legacy `state` binding for backward compatibility, but all
 * replacement of the root state goes through GameState.replace(). This lets
 * us migrate modules incrementally without changing save format or gameplay.
 */
const GameState = (() => {
    let current = null;

    function syncLegacyBinding(next) {
        // `state` remains a compatibility binding for the current modular
        // codebase. It is intentionally synchronized only at the root level.
        state = next;
        current = next;
    }

    return Object.freeze({
        initialize(initialState) {
            if (!initialState || typeof initialState !== 'object') {
                throw new TypeError('GameState.initialize expects an object');
            }
            syncLegacyBinding(initialState);
            return current;
        },

        replace(nextState) {
            if (!nextState || typeof nextState !== 'object') {
                throw new TypeError('GameState.replace expects an object');
            }
            syncLegacyBinding(nextState);
            return current;
        },

        get() {
            return current;
        },

        hasState() {
            return !!current;
        },

        /**
         * Return the live state root. Cores must use this instead of the
         * legacy global `state` binding. Mutating the returned object is
         * intentional: GameState owns the same reference.
         */
        require() {
            if (current) return current;
            // Boot fallback: some early paths may run before initialize().
            if (typeof state !== 'undefined' && state && typeof state === 'object') {
                current = state;
                return current;
            }
            throw new Error('GameState is not initialized');
        },

        snapshot() {
            if (!current) return null;
            try {
                return structuredClone(current);
            } catch (_) {
                return JSON.parse(JSON.stringify(current));
            }
        }
    });
})();

/**
 * Convenience accessor for Game Core modules.
 * Prefer S() / GameState.require() over the legacy global `state` binding.
 * Mutating the returned object is intentional — GameState owns that reference.
 */
function S() {
    return GameState.require();
}


/* ===== js\character-core.js ===== */
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

/* ===== js\settings-core.js ===== */
"use strict";


// Settings Core: settings state transitions only. No DOM or persistence side effects.
const SettingsCore = (() => {
  function ensure() {
    if (!S().settings || typeof S().settings !== 'object') S().settings = {};
    return S().settings;
  }

  function setTheme(themeId) {
    const exists = Array.isArray(THEMES) && THEMES.some(theme => theme.id === themeId);
    if (!exists) return { ok:false, reason:'invalid_theme' };
    ensure().theme = themeId;
    return { ok:true, theme:themeId };
  }

  function setSoundEnabled(on) {
    ensure().soundEnabled = !!on;
    return { ok:true, soundEnabled: ensure().soundEnabled };
  }

  function setNotificationsEnabled(on) {
    ensure().notificationsEnabled = !!on;
    return { ok:true, notificationsEnabled: ensure().notificationsEnabled };
  }

  function setAITheme(theme) {
    if (!Object.prototype.hasOwnProperty.call(AI_THEME_OPTIONS, theme)) return { ok:false, reason:'invalid_theme' };
    ensure().aiTheme = theme;
    return { ok:true, theme };
  }

  function setAIProvider(provider, options = {}) {
    if (provider !== 'tooken') return { ok:false, reason:'invalid_provider' };
    const settings = ensure();
    settings.aiProvider = provider;
    settings.aiModel = 'deepseek-v4-flash';
    return { ok:true, provider, model:settings.aiModel, persist:options.persist !== false };
  }

  function setAIModel(model, provider = null) {
    if (!Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model)) return { ok:false, reason:'invalid_model' };
    const activeProvider = provider || (S().settings?.aiProvider || DEFAULT_AI_PROVIDER);
    if (activeProvider !== 'tooken') return { ok:false, reason:'model_provider_mismatch' };
    ensure().aiModel = model;
    return { ok:true, model };
  }

  function setAIMode(mode) {
    if (mode !== 'free' && mode !== 'own_key') return { ok:false, reason:'invalid_mode' };
    ensure().aiMode = mode;
    return { ok:true, mode };
  }

  function setAIOwnKey(key) {
    const settings = ensure();
    const trimmed = (key == null ? '' : String(key)).trim();
    settings.aiOwnKey = trimmed || null;
    return { ok:true, hasKey: !!settings.aiOwnKey };
  }

  function clearAIOwnKey() {
    ensure().aiOwnKey = null;
    return { ok:true };
  }

  /** Сбрасывает окно при необходимости и возвращает актуальное состояние лимита (скользящие 24 ч) */
  function getAIFreeUsage() {
    const settings = ensure();
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const limit = Number(settings.aiDailyFreeLimit) || 10;

    if (!settings.aiFreeWindowStart || (now - Number(settings.aiFreeWindowStart)) >= windowMs) {
      settings.aiFreeUsed = 0;
      settings.aiFreeWindowStart = now;
    }

    const used = Math.max(0, Number(settings.aiFreeUsed) || 0);
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      windowStart: settings.aiFreeWindowStart
    };
  }

  function incrementAIFreeUsage() {
    getAIFreeUsage(); // сбросит окно при необходимости
    const settings = ensure();
    settings.aiFreeUsed = Math.max(0, Number(settings.aiFreeUsed) || 0) + 1;
    return getAIFreeUsage();
  }

  return Object.freeze({
    setTheme,
    setSoundEnabled,
    setNotificationsEnabled,
    setAITheme,
    setAIProvider,
    setAIModel,
    setAIMode,
    setAIOwnKey,
    clearAIOwnKey,
    getAIFreeUsage,
    incrementAIFreeUsage
  });
})();

/* ===== data\default-state.js ===== */
"use strict";

function defaultState(){
    return {
        character: { name:"", level:1, heroXP:0, coins:0, perkPoints:0, specialPoints:0, perkGenLevel:1, perkGenCount:0, craftGenLevel:1, craftGenCount:0 },
        special: { "💪 Сила":0, "👁️ Восприятие":0, "🛡️ Выносливость":0, "🗣️ Харизма":0, "🧠 Интеллект":0, "⚡ Ловкость":0, "🎲 Удача":0 },
        skills: Object.fromEntries(SKILL_NAMES.map(n => [n, 0])),
        perksUnlocked: [],
        perksAvailable: [],
        raidActive: false,
        raidStartTime: null,
        raidTotalMinutes: 0,
        debuffs: [],
        activeEffects: [],
        nextQuestId: 1,
        quests: {
            planned: [],
            active: [],
            completed: [],
            stats: { completed: 0, failed: 0, aborted: 0 }
        },
        bosses: [],
        activeBossId: null,
        cushion: 0,
        coinLog: [],
        shop: [
            {name:"☕ Кофе растворимый", price:20, rarity:"common", effect:"+5% к концентрации", durationMinutes:30,
             modifiers:{skillPercent:{"🧘 Концентрация":5}}, quote:"Бодрость в каждой чашке"},
            {name:"☕🥛 Кофе растворимый с молоком", price:25, rarity:"uncommon", effect:"+5% к концентрации +3% к продуктивности", durationMinutes:30,
             modifiers:{skillPercent:{"🧘 Концентрация":5,"⚡ Продуктивность":3}}, quote:"Мягкая энергия"},
            {name:"🍵 Чай из пакетика", price:15, rarity:"common", effect:"+3% к коммуникации", durationMinutes:20,
             modifiers:{skillPercent:{"🗣️ Коммуникация":3}}, quote:"Тёплый разговор"},
            {name:"⚡ Банка энергетика", price:50, rarity:"rare", effect:"+8% к продуктивности", durationMinutes:45,
             modifiers:{skillPercent:{"⚡ Продуктивность":8}},
             secondaryEffect:"После окончания баффа: -3% к концентрации на 15 мин", secondaryDurationMinutes:15,
             secondaryModifiers:{skillPercent:{"🧘 Концентрация":3}}, secondaryEffectType:"negative", quote:"Взлёт и падение"},
        ],
        equipment: {
            'Голова': null,
            'Тело': null,
            'Тело верхняя': null,
            'Ноги': null,
            'Ступни': null,
            'Обувь': null,
        },
        accessories: {
            'Запястье (левое)': [],
            'Запястье (правое)': [],
            'Пальцы': [],
            'Шея': [],
            'Гаджет': [],
        },
        inventory: [],
        craftRecipes: [],
        settings: { theme: "nature", soundEnabled: true, notificationsEnabled: true, aiTheme: "real_world", aiProvider: "tooken", aiModel: "deepseek-v4-flash", aiMode: "free" },
        unlocks: { inventory:false, craft:false },
        achievements: createAchievementState(),
        achievementStats: { coinsEarned: 0, attributeUpgrades: 0, consumablesUsed: 0, inventoryItemsObtained: 0, equipmentUniqueNames: [] },
        todayStats: { quests: 0, coins: 0, xp: 0, activitySeconds: 0, date: null },
        totalActivitySeconds: 0,
        buffs: [],
        journal: [],
    };
}

/* ===== js\ai.js ===== */
"use strict";

const AI_PROVIDER_OPTIONS = { tooken: 'AI service' };
const AI_MODEL_OPTIONS = {
  'deepseek-v4.1-flash': 'DeepSeek V4.1 Flash',
  'deepseek-v4-flash': 'DeepSeek V4 Pro',
  'glm-5.3-flash': 'GLM 5.3 Flash',
  'gpt-6-luna': 'GPT-6 Luna',
  'gpt-6-astra': 'GPT-6 Astra'
};
const AI_MODEL_DESCRIPTIONS = {
  'deepseek-v4.1-flash': 'Быстрая и экономичная модель для повседневных генераций.',
  'deepseek-v4-flash': 'Сбалансированная модель для детальных и разнообразных ответов.',
  'glm-5.3-flash': 'Более выразительная модель для сложных и творческих генераций.',
  'gpt-6-luna': 'Модель для подробных и творческих AI-генераций.',
  'gpt-6-astra': 'Модель для сложных задач и развернутых AI-ответов.'
};
const AI_MODEL_COSTS = {
  'deepseek-v4.1-flash': '0.25x',
  'deepseek-v4-flash': '0.3x',
  'glm-5.3-flash': '0.35x',
  'gpt-6-luna': '0.5x',
  'gpt-6-astra': '1.8x'
};
const AI_THEME_OPTIONS = {
  real_world: 'Реальный мир',
  fantasy: 'Фэнтези',
  sci_fi: 'Научная фантастика',
  post_apocalyptic: 'Постапокалипсис'
};
const AI_THEME_DESCRIPTIONS = {
  real_world: 'Современная повседневность, узнаваемые места и реальные жизненные задачи.',
  fantasy: 'Фэнтезийные образы и приключенческий тон; цели и результаты остаются выполнимыми в реальной жизни.',
  sci_fi: 'Футуристические технологии и космический антураж без фантастических изменений реальных целей.',
  post_apocalyptic: 'Атмосфера выживания и восстановления мира; задания остаются безопасными и реалистичными.'
};
const AI_THEME_INSTRUCTIONS = {
  real_world: 'Используй современный, нейтральный и узнаваемый мир. Описывай обычные места и предметы без жанровой стилизации. Все задания, действия и результаты должны быть конкретными и выполнимыми в реальной жизни.',
  fantasy: 'Используй фэнтезийные образы, приключенческий язык и атмосферу сказочного мира в названиях и описаниях. Не представляй магию, монстров или сверхъестественные события как реальные действия: задания и результаты должны оставаться безопасными и выполнимыми в реальной жизни.',
  sci_fi: 'Используй футуристические технологии, космические мотивы и научно-фантастический язык в названиях и описаниях. Не приписывай реальным заданиям фантастические возможности: действия и результаты должны быть правдоподобны и выполнимы в реальной жизни.',
  post_apocalyptic: 'Используй атмосферу постапокалиптического выживания, восстановления и дефицита ресурсов в образах и описаниях. Не предлагай опасное поведение, добычу ресурсов в рискованных местах или насилие: реальные задания должны быть безопасными и выполнимыми.'
};
const DEFAULT_AI_PROVIDER = 'tooken';
const DEFAULT_AI_MODEL = 'deepseek-v4-flash';
const DEFAULT_AI_THEME = 'real_world';

function getAIProvider(){
  const selected = state?.settings?.aiProvider;
  return AI_PROVIDER_OPTIONS[selected] ? selected : DEFAULT_AI_PROVIDER;
}

function getAIModel(){
  const selected = state?.settings?.aiModel;
  return Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, selected) ? selected : DEFAULT_AI_MODEL;
}

function getAIModelLabel(model = getAIModel()){
  return Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model) ? AI_MODEL_OPTIONS[model] : model;
}

function getAITheme(){
  const selected = state?.settings?.aiTheme;
  return Object.prototype.hasOwnProperty.call(AI_THEME_OPTIONS, selected) ? selected : DEFAULT_AI_THEME;
}

function getAIThemeInstruction(){
  return AI_THEME_INSTRUCTIONS[getAITheme()];
}

function setAIProvider(provider){
  if (provider !== 'tooken') return false;
  const result = typeof SettingsCore !== 'undefined' ? SettingsCore.setAIProvider(provider) : {ok:false};
  if (!result.ok) return false;
  if (typeof persist === 'function') persist();
  updateAIStatus();
  return true;
}

function setAIModel(model){
  if (!Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model)) return false;
  const result = typeof SettingsCore !== 'undefined' ? SettingsCore.setAIModel(model, getAIProvider()) : {ok:false};
  if (!result.ok) return false;
  if (typeof persist === 'function') persist();
  updateAIStatus();
  return true;
}

const PROXY_URL = 'https://comfortable-flounder-3259.kreditor14.deno.net';

const PROXY_SECRET = 'credo-2026-xyz';

const AI_FREE_LIMIT_DEFAULT = 10;
const AI_FREE_QUOTA_POLICY = 'rolling-24h-10';
const AI_FREE_QUOTA_CACHE_KEY = 'tc_ai_free_quota_cache';

function readCachedAIServerQuota() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const cached = JSON.parse(localStorage.getItem(AI_FREE_QUOTA_CACHE_KEY) || 'null');
    if (!cached || cached.policy !== AI_FREE_QUOTA_POLICY ||
        !Number.isFinite(Number(cached.remaining)) || !Number.isFinite(Number(cached.limit))) return null;
    return { ...cached, remaining: Math.max(0, Number(cached.remaining)), limit: AI_FREE_LIMIT_DEFAULT, server: false, cached: true };
  } catch (error) {
    console.warn('Could not read cached AI quota status:', error);
    return null;
  }
}

let aiServerQuota = readCachedAIServerQuota();

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem('tc_device_id');
    if (!id) {
      id = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : ('dev-' + Date.now() + '-' + Math.random().toString(36).slice(2));
      localStorage.setItem('tc_device_id', id);
    }
    return id;
  } catch (error) {
    console.error('Could not persist AI quota device ID:', error);
    throw new Error('Не удалось сохранить идентификатор устройства для проверки бесплатного лимита.');
  }
}

function getAIFreeUsage() {
  return aiServerQuota || {
    used: 0,
    limit: AI_FREE_LIMIT_DEFAULT,
    remaining: null,
    policy: null,
    server: false,
    cached: false
  };
}

function canUseFreeRequest() {
  return aiServerQuota?.server === true &&
    aiServerQuota.policy === AI_FREE_QUOTA_POLICY &&
    aiServerQuota.remaining > 0;
}

function storeAIServerQuota(quota) {
  if (!quota || quota.policy !== AI_FREE_QUOTA_POLICY ||
      !Number.isFinite(Number(quota.remaining)) || !Number.isFinite(Number(quota.limit))) {
    throw new Error('AI quota server returned an unsupported policy or malformed status.');
  }
  aiServerQuota = {
    ...quota,
    used: Math.max(0, Number(quota.used) || 0),
    limit: AI_FREE_LIMIT_DEFAULT,
    remaining: Math.max(0, Number(quota.remaining)),
    server: true,
    cached: false,
    refreshedAt: Date.now()
  };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AI_FREE_QUOTA_CACHE_KEY, JSON.stringify(aiServerQuota));
    }
  } catch (error) {
    console.warn('Could not cache AI quota status:', error);
  }
  return aiServerQuota;
}

const REALISM_RULE = `ВАЖНО про баланс: никогда не используй огромные числа вида +100500. Любой игровой эффект предмета — это либо +1..+5 к конкретной характеристике/навыку, либо 1-15% к какому-то бытовому параметру (сон, концентрация, иммунитет и т.п.). Формулируй эффект метафорично, но правдоподобно для реальной вещи.`;
const NO_THINKING_RULE = `КРИТИЧНО: не показывай свои рассуждения, thinking process, план, анализ. Не пиши "Here's a thinking process", "Let me analyze", "1. Analyze" и т.п. Сразу выдавай ТОЛЬКО финальный JSON-объект, ничего до и после.`;
const AI_WORLD_RULE = `Ты работаешь внутри The Creed of Life — RPG-системы реальной жизни. Реальные бытовые задачи, привычки, обучение, работа и крупные жизненные цели превращаются в игровой контент. Следуй выбранной пользователем атмосфере, не меняя реальные задачи и физические результаты.`;
const AI_DESIGN_RULE = `Главный принцип: AI — дизайнер контента, а не игровой движок. Придумывай смысл, название, атмосферу, описание и логические связи. Не создавай новые навыки, слоты, редкости, состояния или другие игровые сущности вне разрешённых списков.`;
const AI_REALISM_RULE = `Не используй магию, сверхъестественные способности или физически невозможные действия как реальные результаты. RPG-стилистика допустима в названиях и образах, но результат должен быть применим к реальной жизни.`;
const AI_EFFECT_RULE = `Эффекты предметов должны быть короткими и реалистичными. Если эффект влияет на игровой показатель, ОБЯЗАТЕЛЬНО возвращай структурированный объект modifiers: для SPECIAL используй specialFlat, для навыков — skillFlat. Значение только +1..+5. Текст effect должен точно описывать тот же модификатор, например "+2 к 🧠 Интеллект" + {"specialFlat":{"🧠 Интеллект":2}} или "+3 к 🧘 Концентрация" + {"skillFlat":{"🧘 Концентрация":3}}. Не используй modifiers для XP героя, монет или Мощи. Бытовые эффекты 1-15% без игрового модификатора допустимы только если они действительно описывают реальный бытовой параметр.`;

function normalizeAIEffectModifiers(raw, effectText=''){
    const out = {specialFlat:{}, skillFlat:{}};
    const validSpecial = new Set(Object.keys(SPECIAL_SKILL_LINKS || {}));
    const validSkills = new Set(SKILL_NAMES || []);
    const read = (source, target, valid) => {
        if (!source || typeof source !== 'object') return;
        Object.entries(source).forEach(([key, value]) => {
            const n = Math.max(1, Math.min(5, Math.round(Number(value))));
            if (valid.has(key) && Number.isFinite(n)) target[key] = n;
        });
    };
    read(raw?.specialFlat, out.specialFlat, validSpecial);
    read(raw?.skillFlat, out.skillFlat, validSkills);
    // Обратная совместимость: если AI всё же вернул только строку "+N к ...",
    // пытаемся восстановить структурированный модификатор по точному имени.
    if (!Object.keys(out.specialFlat).length && !Object.keys(out.skillFlat).length && effectText){
        const nMatch = String(effectText).match(/\+(\d+)/);
        const n = nMatch ? Math.max(1, Math.min(5, Number(nMatch[1]))) : 0;
        if (n) {
            for (const key of validSpecial) if (String(effectText).includes(key)) { out.specialFlat[key] = n; break; }
            if (!Object.keys(out.specialFlat).length) for (const key of validSkills) if (String(effectText).includes(key)) { out.skillFlat[key] = n; break; }
        }
    }
    return (Object.keys(out.specialFlat).length || Object.keys(out.skillFlat).length) ? out : null;
}

const AI_NO_NOTE_RULE = `Поле quote/«Примечание» больше не используется. Не создавай его. Атмосферные фразы, назначение и художественные детали помещай в desc.`;

const JSON_ONLY_RULE = `ОБЯЗАТЕЛЬНО: ответ должен содержать ТОЛЬКО один валидный JSON-объект.
Не используй Markdown, тройные обратные кавычки, пояснения, вступительный текст, заключительный текст, списки или рассуждения вне JSON.
Не обрамляй JSON в \`\`\`json или другие блоки.
Все строковые значения внутри JSON должны быть корректно экранированы.
Если ты не можешь выполнить задачу, всё равно верни валидный JSON требуемой структуры.`;
let aiThinkingIntervalId = null;
let aiThinkingStartTime = null;
let aiCancelRequested = false;
let aiActiveController = null;
let aiRequestInFlight = false;

function usingProxy(){ return !!(PROXY_URL && PROXY_URL.trim()); }

function aiKeyLooksValid(){
  return usingProxy();
  }

async function checkAIAvailability() {
aiAvailable = aiKeyLooksValid();
await refreshAIServerQuota();
updateAIStatus();
return aiAvailable;
}

async function refreshAIServerQuota() {
  if (!usingProxy() || (typeof state !== 'undefined' && state?.settings?.aiMode === 'own_key' && (state?.settings?.aiOwnKey || '').trim())) return aiServerQuota;
  try {
    const response = await fetch(`${PROXY_URL.replace(/\/$/, '')}/quota`, {
      method: 'GET',
      headers: { 'X-Proxy-Secret': PROXY_SECRET, 'X-Device-Id': getOrCreateDeviceId() }
    });
    if (!response.ok) throw new Error(`Quota status unavailable (${response.status})`);
    const quota = await response.json();
    storeAIServerQuota(quota);
  } catch (error) {
    if (aiServerQuota) aiServerQuota = { ...aiServerQuota, server: false, cached: true };
    console.warn('AI quota status could not be refreshed:', error);
  }
  return aiServerQuota;
}

function updateAIStatus() {
  const el = document.getElementById('aiStatus');
  const settingsEl = document.getElementById('aiStatusSettings');
  const usage = getAIFreeUsage();
  const mode = (typeof state !== 'undefined' && state?.settings?.aiMode === 'own_key') ? 'own_key' : 'free';
  const hasKey = !!(typeof state !== 'undefined' && (state?.settings?.aiOwnKey || '').trim());
  const quotaVerified = usage.server === true && usage.policy === AI_FREE_QUOTA_POLICY;

  let label;
  if (!aiAvailable) {
    label = '🤖 AI: не настроен';
  } else if (mode === 'own_key' && hasKey) {
    label = `🤖 AI: свой ключ · ${getAIModelLabel()}`;
  } else if (usage.remaining === null) {
    label = `🤖 AI: бесплатный лимит уточняется при подключении · ${getAIModelLabel()}`;
  } else if (!quotaVerified) {
    label = `🤖 AI: бесплатно ${usage.remaining}/${usage.limit} · последний статус · ${getAIModelLabel()}`;
  } else {
    label = `🤖 AI: бесплатно ${usage.remaining}/${usage.limit} · ${getAIModelLabel()}`;
  }

  if (el) { el.textContent = label; el.className = 'ai-status ' + (aiAvailable ? 'online' : 'offline'); }
  if (settingsEl) settingsEl.textContent = label;

  const freeLeftEl = document.getElementById('aiFreeLeft');
  if (freeLeftEl) {
    freeLeftEl.textContent = (mode === 'own_key' && hasKey)
      ? 'Режим: свой ключ (лимит не расходуется)'
      : usage.remaining === null
        ? 'Бесплатный лимит: 10 успешных запросов за скользящие 24 часа · статус уточняется при подключении'
        : !quotaVerified
          ? `Последний серверный статус: осталось ${usage.remaining} из ${usage.limit}; обновится при подключении`
          : `Осталось бесплатных запросов: ${usage.remaining} из ${usage.limit} (скользящие 24 ч)`;
  }
}

async function queryAI(prompt, systemPrompt = '', options = {}) {
  if (!usingProxy()) {
    throw new Error('PROXY_URL не настроен — AI-функции недоступны. Укажи адрес прокси-Worker\'а в константе PROXY_URL.');
  }
  if (aiRequestInFlight) {
    throw new Error('AI уже обрабатывает другой запрос. Дождись его завершения.');
  }

  const settings = (typeof state !== 'undefined' && state?.settings) ? state.settings : {};
  const mode = settings.aiMode === 'own_key' ? 'own_key' : 'free';
  const ownKey = (settings.aiOwnKey || '').trim();
  const useOwnKey = mode === 'own_key' && !!ownKey;

  if (!useOwnKey) {
    const quota = await refreshAIServerQuota();
    if (!quota || quota.server !== true || quota.policy !== AI_FREE_QUOTA_POLICY) {
      throw new Error('Не удалось подтвердить бесплатный лимит на сервере. Подключись к сети и проверь, что AI Worker обновлён.');
    }
    if (quota.remaining <= 0) {
      const err = new Error(
        'Бесплатный лимит AI (10 успешных запросов за скользящие 24 часа) исчерпан.\n' +
        'Вставь свой API-ключ в настройках или дождись освобождения запроса.'
      );
      err.code = 'FREE_LIMIT_EXCEEDED';
      throw err;
    }
  }
  if (aiRequestInFlight) {
    throw new Error('AI уже обрабатывает другой запрос. Дождись его завершения.');
  }

  const maxTokens = Math.max(500, Math.min(2500, Number(options.maxTokens) || 2000));
  const temperature = Number.isFinite(Number(options.temperature)) ? Number(options.temperature) : 0.8;
  const topP = Number.isFinite(Number(options.topP)) ? Number(options.topP) : 0.9;
  const model = Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, options.model) ? options.model : getAIModel();

  const effectiveSystemPrompt = [JSON_ONLY_RULE, NO_THINKING_RULE, getAIThemeInstruction(), systemPrompt]
    .filter(Boolean)
    .join('\n\n');
  const messages = [
    { role: 'system', content: effectiveSystemPrompt },
    { role: 'user', content: prompt }
  ];

  const headers = {
    'Content-Type': 'application/json',
    'X-Proxy-Secret': PROXY_SECRET,
    'X-Client-Version': '3.7.5'
  };
  if (!useOwnKey) headers['X-Device-Id'] = getOrCreateDeviceId();

  const body = {
    provider: 'tooken',
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    top_p: topP
  };
  if (useOwnKey) body.userApiKey = ownKey;

  aiRequestInFlight = true;
  let quotaReservation = null;
  let quotaReservationHandled = false;
  try {
    if (aiCancelRequested) throw cancelledError();

    const controller = new AbortController();
    aiActiveController = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    let response;
    try {
      response = await fetch(PROXY_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (networkErr) {
      if (aiCancelRequested) throw cancelledError();
      throw new Error('Не удалось связаться с AI-прокси. Запрос не повторялся, чтобы не расходовать лимит.');
    } finally {
      clearTimeout(timeoutId);
      aiActiveController = null;
    }

    if (!useOwnKey) quotaReservation = response.headers?.get?.('X-Quota-Reservation') || null;
    if (aiCancelRequested) throw cancelledError();

    if (response.status === 429) {
      let quotaError = {};
      try { quotaError = await response.json(); } catch {}
      if (quotaError.code === 'FREE_LIMIT_EXCEEDED') {
        storeAIServerQuota({ ...quotaError, policy: AI_FREE_QUOTA_POLICY });
        updateAIStatus();
      } else if (!useOwnKey) {
        await refreshAIServerQuota();
        updateAIStatus();
      }
      const err = new Error(
        quotaError.code === 'FREE_LIMIT_EXCEEDED'
          ? (quotaError.error || 'Бесплатный лимит AI исчерпан.')
          : useOwnKey
          ? 'Лимит провайдера или временное ограничение. Попробуй позже.'
          : 'Лимит AI-запросов исчерпан. Вставь свой ключ в настройках или подожди.'
      );
      err.code = quotaError.code || 'RATE_LIMIT';
      throw err;
    }

    if (!response.ok) {
      let detail = response.statusText;
      try {
        const errBody = await response.json();
        detail = errBody.error?.message || errBody.error || errBody.message || detail;
      } catch {}
      if (response.status === 403) {
        throw new Error('Worker отклонил запрос (403): проверь PROXY_SECRET.');
      }
      if (response.status === 401) {
        throw new Error(
          useOwnKey
            ? 'Невалидный API-ключ. Проверь ключ в настройках.'
            : 'AI-провайдер отклонил ключ (401) — проверь API key на Deno.'
        );
      }
      throw new Error(`Ошибка AI (${response.status}): ${detail}. Запрос не повторялся.`);
    }

    if (!useOwnKey && response.headers?.get?.('X-Quota-Policy') !== AI_FREE_QUOTA_POLICY) {
      throw new Error('AI Worker использует неподдерживаемую политику лимита. Обнови Worker и повтори запрос.');
    }
    if (!useOwnKey && !quotaReservation) {
      throw new Error('AI Worker не зарезервировал квоту. Бесплатный запрос не может быть подтверждён.');
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      parsed = parseAIJson(text);
    } catch (parseErr) {
      throw new Error(`${parseErr.message} Запрос не повторялся, чтобы не расходовать лимит.`);
    }
    if (!useOwnKey) {
      await settleAIQuota(quotaReservation, true);
      quotaReservationHandled = true;
      await refreshAIServerQuota();
      updateAIStatus();
    }
    return parsed;
  } finally {
    if (!useOwnKey && quotaReservation && !quotaReservationHandled) {
      await settleAIQuota(quotaReservation, false);
      quotaReservationHandled = true;
    }
    aiRequestInFlight = false;
    aiActiveController = null;
  }
}

async function settleAIQuota(reservation, commit) {
  if (!reservation) return null;
  try {
    const response = await fetch(`${PROXY_URL.replace(/\/$/, '')}/quota/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Proxy-Secret': PROXY_SECRET, 'X-Device-Id': getOrCreateDeviceId() },
      body: JSON.stringify({ reservation, commit })
    });
    if (!response.ok) throw new Error(`Quota settlement unavailable (${response.status})`);
    return storeAIServerQuota(await response.json());
  } catch (error) {
    console.warn('AI quota settlement will rely on the server reservation:', error);
    return null;
  }
}

function cancelledError(){
const err = new Error('Генерация отменена.');
err.cancelled = true;
return err;
}

function parseAIJson(text){
  if (window.DEBUG_AI) console.log('[AI raw]', text);
  
    // Отрезаем явный "thinking", если он отделён маркерами
    let cleaned = text
      .replace(/<\/?think>/gi, '')
      .replace(/```(?:json)?\s*([\s\S]*?)```/gi, (m, p1) => '\n' + p1 + '\n');
  
    // Собираем ВСЕ сбалансированные JSON-фрагменты и пробуем с конца —
    // reasoning-модели пишут рассуждения первыми, JSON последним.
    const candidates = [];
    const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) candidates.push(fenced[1].trim());
  
    let idx = 0;
    while (idx < cleaned.length){
      const start = cleaned.indexOf('{', idx);
      if (start === -1) break;
      const extracted = extractBalancedJson(cleaned.slice(start));
      if (extracted){
        candidates.push(extracted);
        idx = start + extracted.length;
      } else {
        idx = start + 1;
      }
    }
    candidates.push(cleaned.trim());
  
    // Пробуем с КОНЦА (там настоящий ответ), потом остальные
    const ordered = candidates.slice().reverse();
    for (const candidate of ordered){
      const parsed = tryParseJsonLenient(candidate);
      if (parsed !== undefined && typeof parsed === 'object') return parsed;
    }
    throw new Error('AI не вернул валидный JSON — модель ушла в рассуждения или обрезала ответ. Попробуй ещё раз или смени модель.');
  }

function extractBalancedJson(text){
const closerFor = { '{': '}', '[': ']' };
for (let i = 0; i < text.length; i++){
const opener = text[i];
if (opener !== '{' && opener !== '[') continue;
const closer = closerFor[opener];
let depth = 0;
let inString = false;
let escape = false;
for (let j = i; j < text.length; j++){
const c = text[j];
if (inString){
if (escape) { escape = false; }
else if (c === '\\') { escape = true; }
else if (c === '"') { inString = false; }
continue;
}
if (c === '"') { inString = true; continue; }
if (c === opener) depth++;
else if (c === closer) {
depth--;
if (depth === 0) return text.slice(i, j + 1);
}
}
break; // первая открывающая скобка не закрылась корректно — дальше не ищем от неё
}
return null;
}

function tryParseJsonLenient(str){
if (!str) return undefined;
try { return JSON.parse(str); } catch {}
const cleaned = str
.replace(/[\u201C\u201D]/g, '"')
.replace(/[\u2018\u2019]/g, "'")
.replace(/,\s*([}\]])/g, '$1');
try { return JSON.parse(cleaned); } catch {}
return undefined;
}

function normalizeAIQuestSkills(rawSkills){
    const valid = new Set(Array.isArray(SKILL_NAMES) ? SKILL_NAMES : []);
    const selected = Array.isArray(rawSkills)
        ? rawSkills.filter(s => valid.has(s))
        : [];
    return [...new Set(selected)].slice(0, 3);
}

function questRewardRarity(){
    return typeof rollConsumableRarity === 'function' ? rollConsumableRarity() : 'common';
}

function normalizeAIQuestRewardItem(raw, type){
    if (!raw || typeof raw !== 'object' || !String(raw.name || '').trim()) return null;
    const item = {
        name: String(raw.name).trim().slice(0, 80),
        type,
        desc: String(raw.desc || '').trim().slice(0, 500),
        effect: String(raw.effect || '').trim().slice(0, 120),
        modifiers: normalizeAIEffectModifiers(raw.modifiers, String(raw.effect || '').trim()),
        source: 'ai'
    };

    if (type === 'material') {
        item.rarity = 'common';
        item.effect = '';
        item.modifiers = null;
        item.durationMinutes = null;
        item.slot = null;
        if (looksLikeFinishedProduct(item.name)) {
            item.name = '🧱 Универсальная заготовка';
            item.desc = 'Базовый материальный ресурс для бытового крафта.';
        }
        return item;
    }

    item.rarity = questRewardRarity();

    if (type === 'consumable') {
        item.durationMinutes = normalizeConsumableDuration(raw.durationMinutes, 30);
        item.slot = null;
        if (!item.effect) item.effect = '+2 к полезному показателю на время';
        return item;
    }

    const validSlots = new Set(SLOT_ORDER || []);
    item.slot = validSlots.has(raw.slot) ? raw.slot : (SLOT_ORDER?.[Math.floor(Math.random() * SLOT_ORDER.length)] || 'Аксессуар');
    item.condition = 'good';
    item.itemLevel = Math.max(1, Number(state.character?.level) || 1);
    return item;
}

async function generateQuestWithAI(theme) {
    const systemPrompt = `${NO_THINKING_RULE}
${AI_WORLD_RULE}
${AI_DESIGN_RULE}
${AI_REALISM_RULE}
${AI_EFFECT_RULE}
${AI_NO_NOTE_RULE}

Ты — генератор содержательных квестов для реальных бытовых задач.
Навыки разрешено выбирать ТОЛЬКО из списка: ${SKILL_NAMES.join(', ')}.
ПРАВИЛА:
- Название короткое, выразительное, с эмодзи; не просто название бытового действия.
- desc: 2-3 предложения; конкретно объясни задачу и ожидаемый результат.
- skills: 1-3 действительно используемых навыка.
- Не генерируй difficulty, minutes, XP героя, монеты, rarity, condition, itemLevel, power, ID или коэффициенты — это рассчитывает игра.
- items — только кандидаты наград и только если они логично связаны с квестом.
- material = сырьё/ресурс, а не готовый товар.
- consumable = одноразовый реалистичный расходник с временным эффектом 15-1440 минут.
- equipment = экипируемый предмет со слотом из списка; не указывай его rarity, condition, itemLevel или power.
JSON:
{"title":"название с эмодзи","desc":"описание","skills":["точное название навыка"],"items":[{"type":"material","name":"сырьё","desc":"описание"},{"type":"consumable","name":"расходник","desc":"описание","effect":"+2 к 🧘 Концентрация","modifiers":{"skillFlat":{"🧘 Концентрация":2}},"durationMinutes":30},{"type":"equipment","name":"снаряжение","desc":"описание","effect":"+1 к 🎲 Удача","modifiers":{"specialFlat":{"🎲 Удача":1}},"slot":"Аксессуар"}]}
Верни только один JSON-объект.`;
    const prompt = `Создай один квест на тему: "${theme || 'случайное приключение'}". Сделай его выполнимым в реальной жизни и логично связанным с выбранными навыками и кандидатами наград.`;
    const result = await queryAI(prompt, systemPrompt);
    const skills = normalizeAIQuestSkills(result?.skills);
    return { title: typeof result?.title === 'string' && result.title.trim() ? result.title.trim() : '📜 Новый квест', desc: typeof result?.desc === 'string' && result.desc.trim() ? result.desc.trim() : 'Выполни задачу последовательно и доведи её до результата.', difficulty: 'normal', minutes: 30, skills, items: Array.isArray(result?.items) ? result.items : [] };
}

function normalizeGeneratedBossPhases(phases, bossType, fallbackPhases) {
    const fallback = fallbackPhases.map(p => ({ ...p }));
    if (!Array.isArray(phases) || !phases.length) return fallback;
    if (bossType === 'financial') {
        const fixedPcts = [20, 30, 50];
        return fixedPcts.map((pct, i) => {
            const src = phases[i] || fallback[i];
            return {
                ...src,
                name: typeof src.name === 'string' && src.name.trim() ? src.name.trim() : fallback[i].name,
                pct,
                rewardXP: Math.max(0, Number(src.rewardXP) || fallback[i].rewardXP),
                skill: SKILL_NAMES.includes(src.skill) ? src.skill : fallback[i].skill,
                skillXP: Math.max(0, Number(src.skillXP) || fallback[i].skillXP)
            };
        });
    }
    const usable = phases.slice(0, 4).filter(p => p && typeof p === 'object');
    if (usable.length < 2) return fallback;
    const weights = usable.map(p => {
        const n = Number(p.pct);
        return Number.isFinite(n) && n > 0 ? n : 1;
    });
    const total = weights.reduce((a,b) => a+b, 0);
    const rounded = weights.map((w, i) => i === weights.length - 1
        ? 100 - weights.slice(0,-1).reduce((a,x) => a + Math.round(x / total * 100), 0)
        : Math.round(w / total * 100));
    return usable.map((src, i) => {
        const fb = fallback[Math.min(i, fallback.length - 1)];
        return {
            ...src,
            name: typeof src.name === 'string' && src.name.trim() ? src.name.trim() : `Фаза ${i + 1}`,
            pct: rounded[i],
            rewardXP: Math.max(0, Number(src.rewardXP) || fb.rewardXP),
            skill: SKILL_NAMES.includes(src.skill) ? src.skill : fb.skill,
            skillXP: Math.max(0, Number(src.skillXP) || fb.skillXP)
        };
    });
}

async function generateBossWithAI(theme, bossType, targetHint, unitHint) {
const skillList = SKILL_NAMES.join(', ');
let systemPrompt, prompt;
if (bossType === 'other') {
systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\nТы — генератор крупных жизненных боссов, не связанных с деньгами. Единица прогресса должна быть реально измеримой. 2-4 фазы, pct суммарно 100. Если target/unit заданы игроком — не изменяй их. Каждая фаза получает только rewardXP и skillXP одного существующего навыка. Монеты и Мощь не создавай. Навыки: ${skillList}.\nJSON: {"name":"имя с эмодзи","goal":"цель","unit":"часы","target":120,"phases":[{"name":"Фаза I","pct":30,"rewardXP":80,"skill":"🎯 Концентрация","skillXP":40},{"name":"Фаза II","pct":30,"rewardXP":150,"skill":"🎯 Концентрация","skillXP":70},{"name":"Фаза III","pct":40,"rewardXP":250,"skill":"🎯 Концентрация","skillXP":100}]}\nВерни только JSON.`;
prompt = `Создай босса на тему: "${theme || 'крупная жизненная цель'}".` + (targetHint ? ` Целевая величина: ${targetHint}${unitHint ? ' ' + unitHint : ''}. Используй как есть.` : ' Сам выбери разумную измеримую цель.');
} else {
systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\nТы — генератор финансовых боссов. Всегда ровно 3 фазы: 20%, 30%, 50% — эти доли фиксированы. Каждая фаза получает только rewardXP и skillXP одного существующего навыка. Монеты и Мощь не выдаются. Навыки: ${skillList}. target игрока не изменять; unit всегда ₽.\nJSON: {"name":"имя с эмодзи","goal":"цель","target":100000,"phases":[{"name":"Фаза I","rewardXP":80,"skill":"💰 Финансы","skillXP":40},{"name":"Фаза II","rewardXP":150,"skill":"💰 Финансы","skillXP":70},{"name":"Фаза III","rewardXP":280,"skill":"💰 Финансы","skillXP":120}]}\nВерни только JSON.`;
prompt = `Создай финансового босса на тему: "${theme || 'крупная денежная цель'}".` + (targetHint ? ` Целевая сумма: ${targetHint} ₽. Используй её как есть.` : ' Если сумма не задана, выбери цель от 50000 до 500000 ₽.');
}
return await queryAI(prompt, systemPrompt);
}

async function generateBossVictoryRewardWithAI(boss) {
const level = Math.max(1, Number(state.character?.level) || 1);
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор награды за победу над боссом. Создай один тематический экипируемый предмет и персональное достижение. Слоты: ${SLOT_ORDER.join(', ')}. Редкости: common, uncommon, rare, epic, legendary, unique, mythical. Состояния: broken, damaged, worn, good, reliable, excellent, perfect. itemLevel ОБЯЗАТЕЛЬНО ${level}. Не указывай power. bonusCoins умеренный. quote запрещён.\nJSON: {"item":{"name":"название с эмодзи","type":"equipment","rarity":"epic","slot":"Аксессуар","condition":"good","itemLevel":${level},"desc":"описание и атмосфера","effect":"+2 к 🧠 Интеллект","modifiers":{"specialFlat":{"🧠 Интеллект":2}}},"achievement":{"icon":"🏆","title":"название","desc":"одно предложение"},"bonusCoins":100}\nВерни только JSON.`;
const result = await queryAI(`Игрок победил босса "${boss.name}" с целью "${boss.goal}". Создай награду, связанную именно с этой победой.`, systemPrompt);
if (result?.item) { delete result.item.quote; result.item.modifiers = normalizeAIEffectModifiers(result.item.modifiers, result.item.effect); }
return result;
}

async function generateShopItemWithAI(theme) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор товаров магазина TCoL. Создавай обычный доступный бытовой расходник: еду, напиток, средство ухода, канцелярскую мелочь или полезный набор. Не создавай оружие, магию или экипировку. effect обязателен, durationMinutes 15-1440. rarity: common/uncommon/rare/epic/legendary/unique/mythical. price 10-150. quote запрещён.\nJSON: {"name":"название с эмодзи","price":25,"rarity":"common","effect":"+2 к 🧘 Концентрация","modifiers":{"skillFlat":{"🧘 Концентрация":2}},"durationMinutes":30,"desc":"описание, назначение и атмосфера"}\nВерни только JSON.`;
const result = await queryAI(`Придумай один товар для магазина на тему: "${theme || 'что-нибудь полезное на каждый день'}".`, systemPrompt);
if (result && typeof result === 'object') { delete result.quote; result.modifiers = normalizeAIEffectModifiers(result.modifiers, result.effect); }
return result;
}

function normalizeCraftRecipes(recipes, materials) {
    if (!Array.isArray(recipes) || !Array.isArray(materials)) return [];
    const owned = new Map(materials.map(m => [String(m.name || '').trim(), Math.max(0, Number(m.qty) || 1)]));
    const validSlots = new Set(SLOT_ORDER);
    const validTypes = new Set(['equipment', 'consumable']);
    const validRarities = new Set(RARITY_ORDER);
    const equipmentCategoryToSlot = {
        'Шлем':'Голова','Головной убор':'Голова','Броня':'Тело','Доспех':'Тело',
        'Плащ':'Тело верхняя','Перчатки':'Перчатки','Поножи':'Ноги',
        'Сапоги':'Ступни','Обувь':'Обувь','Рюкзак':'Рюкзак',
        'Кольцо':'Пальцы','Амулет':'Шея','Талисман':'Шея',
        'Наруч':'Запястье (левое)','Браслет':'Запястье (левое)','Гаджет':'Гаджет'
    };
    const equipmentTypes = new Set(Object.keys(equipmentCategoryToSlot));
    const consumableTypes = new Set([
        'Еда','Напиток','Эликсир','Зелье','Настой','Свиток',
        'Талисман','Боевая смесь','Ремкомплект','Средство ухода','Набор'
    ]);
    const rarityCapByUnits = units => units >= 8 ? 'epic' : units >= 6 ? 'rare' : units >= 4 ? 'uncommon' : 'common';
    const rarityRank = r => Math.max(0, RARITY_ORDER.indexOf(r));
    const capRank = r => Math.max(0, RARITY_ORDER.indexOf(r));
    const result = [];

    for (const raw of recipes.slice(0, 3)) {
        if (!raw || typeof raw !== 'object' || typeof raw.name !== 'string') continue;
        if (!Array.isArray(raw.materials)) continue;

        const used = new Map();
        for (const entry of raw.materials) {
            const name = typeof entry === 'string' ? entry.trim() : String(entry?.name || '').trim();
            const qty = typeof entry === 'string' ? 1 : Math.floor(Number(entry?.qty));
            if (!name || !owned.has(name) || !Number.isFinite(qty) || qty < 1 || qty > 5) continue;
            if (!used.has(name)) used.set(name, Math.min(qty, Math.floor(owned.get(name))));
        }

        if (used.size < 2) continue;
        const materialList = [...used.entries()].map(([name, qty]) => ({ name, qty }));
        const totalUnits = materialList.reduce((sum, m) => sum + m.qty, 0);
        if (totalUnits < 2 || totalUnits > 10) continue;

        const type = validTypes.has(raw.type) ? raw.type : 'equipment';
        const rarity = validRarities.has(raw.rarity) ? raw.rarity : 'common';
        const cap = rarityCapByUnits(totalUnits);
        const finalRarity = rarityRank(rarity) <= capRank(cap) ? rarity : cap;
        const effect = typeof raw.effect === 'string' ? raw.effect.trim().slice(0, 120) : '';
        const safeEffect = /(?:^|\s)\+?[1-5](?:\s|$)|(?:^|\s)1[0-5]%(?:\s|$)/.test(effect) ? effect : '';
        const modifiers = normalizeAIEffectModifiers(raw.modifiers, effect);
        const desc = typeof raw.desc === 'string' ? raw.desc.trim().slice(0, 500) : '';

        if (!safeEffect) continue;

        if (type === 'consumable') {
            const category = consumableTypes.has(raw.category) ? raw.category : 'Эликсир';
            const duration = Math.max(15, Math.min(1440, Math.floor(Number(raw.durationMinutes) || 30)));
            result.push({
                name: raw.name.trim().slice(0, 80),
                type,
                category,
                materials: materialList,
                rarity: finalRarity,
                effect: safeEffect,
                modifiers,
                desc,
                slot: null,
                power: 0,
                durationMinutes: duration,
                secondaryEffect: typeof raw.secondaryEffect === 'string' ? raw.secondaryEffect.trim().slice(0, 120) : '',
                secondaryDurationMinutes: raw.secondaryDurationMinutes ? Math.max(15, Math.min(1440, Math.floor(Number(raw.secondaryDurationMinutes) || 15))) : 0
            });
        } else {
            const category = equipmentTypes.has(raw.category) ? raw.category : (validSlots.has(raw.slot) ? raw.slot : 'Шлем');
            const mappedSlot = equipmentCategoryToSlot[category];
            const slot = validSlots.has(mappedSlot) ? mappedSlot : (validSlots.has(raw.slot) ? raw.slot : 'Голова');
            result.push({
                name: raw.name.trim().slice(0, 80),
                type,
                category,
                materials: materialList,
                rarity: finalRarity,
                effect: safeEffect,
                modifiers,
                desc,
                slot,
                itemLevel: Math.max(1, Math.floor(Number(raw.itemLevel) || Number(state.character?.level) || 1)),
                condition: EQUIPMENT_CONDITION_ALIASES[raw.condition] || raw.condition || 'good'
            });
        }
    }
    return result;
}

async function generateCraftRecipesWithAI(materials) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\n${AI_NO_NOTE_RULE}\nТы — генератор рецептов крафта The Creed of Life. РОВНО ОДИН рецепт. Используй ТОЛЬКО материалы из списка игрока и сохраняй их точные названия. 2-3 разных материала, qty 1-5 каждого, суммарно 2-10. Не используй бренды. Не зацикливайся на контейнерах, держателях, органайзерах и чехлах. Результат должен быть физически связан с материалами. type только equipment или consumable. Не возвращай power. quote запрещён. Для equipment: category ТОЛЬКО из: Шлем, Головной убор, Броня, Доспех, Плащ, Перчатки, Поножи, Сапоги, Обувь, Рюкзак, Кольцо, Амулет, Талисман, Наруч, Браслет, Гаджет. slot должен соответствовать category: Шлем/Головной убор→Голова; Броня/Доспех→Тело; Плащ→Тело верхняя; Перчатки→Перчатки; Поножи→Ноги; Сапоги→Ступни; Обувь→Обувь; Рюкзак→Рюкзак; Кольцо→Пальцы; Амулет/Талисман→Шея; Наруч/Браслет→Запястье (левое); Гаджет→Гаджет. condition только broken/damaged/worn/good/reliable/excellent/perfect, itemLevel ${Number(state.character?.level) || 1}. Для consumable: category ТОЛЬКО из: Еда, Напиток, Эликсир, Зелье, Настой, Свиток, Талисман, Боевая смесь, Ремкомплект, Средство ухода, Набор; durationMinutes 15-1440.\nJSON-массив: [{"name":"название с эмодзи","type":"equipment","category":"Перчатки","materials":[{"name":"точный материал 1","qty":2},{"name":"точный материал 2","qty":1}],"slot":"Перчатки","rarity":"common","itemLevel":${Number(state.character?.level) || 1},"condition":"good","effect":"+1 к 🛠️ Ручной труд","modifiers":{"skillFlat":{"🛠️ Ручной труд":1}},"desc":"подробное описание предмета и назначения"}]\nВерни только JSON-массив.`;
const materialsDesc = materials.map(m => `${m.name} (доступно ×${Math.max(0, Number(m.qty) || 1)})`).join(', ');
const prompt = `Материалы игрока: ${materialsDesc}. Создай ОДИН рецепт, выбрав equipment или consumable. Рецепт должен иметь очевидную причинно-следственную связь между материалами и результатом.`;
const result = await queryAI(prompt, systemPrompt);
const normalized = normalizeCraftRecipes(Array.isArray(result) ? result : (result.recipes || [result]), materials);
if (Array.isArray(normalized)) normalized.forEach(r => { if (r?.type === 'equipment') r.itemLevel = Number(state.character?.level) || 1; if (r) delete r.quote; });
return normalized[0] || null;
}

const QUEST_MATERIAL_PRODUCT_WORDS = [
    'телефон','смартфон','планшет','ноутбук','компьютер','монитор','клавиатур','мышь','наушник','гарнитур',
    'часы','смарт-часы','кружк','термокружк','бутылк','рюкзак','сумк','перчатк','куртк','футболк','обув',
    'кроссовк','ремень','браслет','очки','органайзер','контейнер','держатель','чехол','инструмент','отвёртк',
    'отвертк','молоток','плоскогуб','фонарик','мультитул','велосипед','самокат','зарядник','адаптер','колонк'
];

function looksLikeFinishedProduct(name){
    const s = String(name || '').toLowerCase();
    return QUEST_MATERIAL_PRODUCT_WORDS.some(word => s.includes(word));
}

function normalizeAIQuestMaterial(item){
    if (!item || item.type !== 'material' || !item.name) return null;
    const material = {...item};
    material.type = 'material';
    material.rarity = 'common';
    material.effect = '';
    material.durationMinutes = null;
    material.slot = null;
    if (looksLikeFinishedProduct(material.name)) {
        material.name = '🧱 Универсальная заготовка';
        material.desc = 'Базовый материальный ресурс для бытового крафта.';
        delete material.quote;
    }
    return material;
}

function rollAIQuestRewardItems(items){
    const candidates = Array.isArray(items) ? items.filter(it => it && it.name) : [];
    const byType = type => candidates.find(it => it.type === type);

    // Материал — гарантированная награда. Для всех типов используем единую
    // нормализацию, чтобы modifiers/rarity/slot/duration не зависели от того,
    // какая версия обработчика была вызвана.
    const material = normalizeAIQuestRewardItem(byType('material'), 'material') || {
        name: '🧱 Универсальная заготовка',
        type: 'material',
        rarity: 'common',
        desc: 'Базовый материальный ресурс для бытового крафта.',
        effect: '',
        modifiers: null,
        durationMinutes: null,
        slot: null,
        source: 'ai'
    };
    const consumable = normalizeAIQuestRewardItem(byType('consumable'), 'consumable');
    const equipment = normalizeAIQuestRewardItem(byType('equipment'), 'equipment');

    const result = [material];
    // Расходник — 80%.
    if (consumable && Math.random() < 0.80) result.push(consumable);
    // Снаряжение — 40%.
    if (equipment && Math.random() < 0.40) result.push(equipment);
    return result;
}

function wireAI() {
const aiQuestBtn = document.getElementById('aiGenerateQuest');
const aiBossBtn = document.getElementById('aiGenerateBoss');
if (aiQuestBtn) {
aiQuestBtn.addEventListener('click', async () => {
if (!aiAvailable) {
toast('🤖 AI недоступен. Проверьте интернет-соединение.');
return;
}
const theme = (document.getElementById('aiQuestTheme')?.value || '').trim();
try {
const questData = await withAIThinking('🤖 Генерирую квест...', () => generateQuestWithAI(theme || 'случайное приключение'));
      pendingQuestGeneratedByAI = true;
const titleEl = document.getElementById('qNewTitle');
const descEl = document.getElementById('qNewDesc');
const diffEl = document.getElementById('qNewDifficulty');
const minEl = document.getElementById('qNewMinutes');
if (!questData || !questData.title || !questData.desc) {
    console.error('AI вернул неожиданную структуру:', questData);
    throw new Error('AI вернул ответ без полей title/desc. Попробуй ещё раз.');
  }
  if (titleEl) titleEl.value = questData.title;
  if (descEl) descEl.value = questData.desc;
  if (diffEl) diffEl.value = questData.difficulty || 'normal';
  if (minEl) minEl.value = questData.minutes || 30;
if (questData.skills && Array.isArray(questData.skills)) {
document.querySelectorAll('#qNewSkillsPick input[type=checkbox]').forEach(cb => {
cb.checked = questData.skills.includes(cb.value);
cb.closest(".skill-pick-label").classList.toggle("picked", cb.checked);
});
}
pendingQuestItems = rollAIQuestRewardItems(questData.items);
updatePreview();
toast(pendingQuestItems.length ? `✅ Квест сгенерирован, награда: ${pendingQuestItems.map(i=>i.name).join(', ')}` : '✅ Квест сгенерирован AI!');
} catch(error) {
toastAIError(error);
}
});
}
if (aiBossBtn) {
aiBossBtn.addEventListener('click', async () => {
if (!aiAvailable) {
toast('🤖 AI недоступен. Проверьте интернет-соединение.');
return;
}
const theme = (document.getElementById('aiBossTheme')?.value || '').trim();
const typeEl = document.getElementById('bossNewType');
const targetEl0 = document.getElementById('bossNewTarget');
const unitEl0 = document.getElementById('bossNewUnit');
const bossType = typeEl ? typeEl.value : 'financial';
const targetHint = targetEl0 && Number(targetEl0.value) > 0 ? Number(targetEl0.value) : null;
const unitHint = unitEl0 && unitEl0.value.trim() ? unitEl0.value.trim() : null;
try {
const bossData = await withAIThinking('🤖 Генерирую босса...', () => generateBossWithAI(theme || (bossType === 'other' ? 'крупная жизненная цель' : 'крупная денежная цель'), bossType, targetHint, unitHint));
const nameEl = document.getElementById('bossNewName');
const goalEl = document.getElementById('bossNewGoal');
const targetEl = document.getElementById('bossNewTarget');
const unitEl = document.getElementById('bossNewUnit');
const finalTarget = targetHint || bossData.target || 100000;
const finalUnit = bossType === 'financial' ? '₽' : (unitHint || bossData.unit || 'ед.');
if (nameEl) nameEl.value = bossData.name || '🎯 Крупная цель';
if (goalEl) goalEl.value = bossData.goal || 'Довести проект до конца';
if (targetEl) targetEl.value = finalTarget;
if (unitEl) unitEl.value = finalUnit;
const defaultPhases = bossType === 'financial'
? [
{name: "Фаза I", pct: 20, rewardXP: 80, skill: "💰 Финансы", skillXP: 40},
{name: "Фаза II", pct: 30, rewardXP: 150, skill: "💰 Финансы", skillXP: 70},
{name: "Фаза III", pct: 50, rewardXP: 280, skill: "💰 Финансы", skillXP: 120},
]
: [
{name: "Фаза I", pct: 34, rewardXP: 80, skill: "🎯 Концентрация", skillXP: 40},
{name: "Фаза II", pct: 33, rewardXP: 150, skill: "📋 Менеджмент", skillXP: 70},
{name: "Фаза III", pct: 33, rewardXP: 280, skill: "⚖️ Ответственность", skillXP: 120},
];
// Для финансового типа доли фиксированы (20/30/50) вне зависимости от того,
// что вернул AI — это правило игры, а не предложение AI.
const phasesSource = normalizeGeneratedBossPhases(bossData.phases, bossType, defaultPhases);
const boss = {
id: "boss_" + Date.now(),
name: bossData.name || '🎯 Крупная цель',
goal: bossData.goal || 'Довести проект до конца',
target: finalTarget,
bossType,
unit: finalUnit,
createdAt: Date.now(),
victoryRewarded: false,
phases: phasesSource.map(p => ({
name: p.name || `Фаза ${p.pct || 30}%`,
target: Math.round(finalTarget * (p.pct || 30) / 100),
progress: 0,
defeated: false,
// Награда — только XP персонажа и XP одного навыка, монет нет
reward: { heroXP: p.rewardXP || 100, skills: p.skill ? { [p.skill]: p.skillXP || 30 } : {} },
applied: false
}))
};
if (typeof BossCore === 'undefined' || !BossCore.create(boss)) throw new Error('Не удалось создать босса');
if (nameEl) nameEl.value = "";
if (goalEl) goalEl.value = "";
if (targetEl) targetEl.value = "";
if (unitEl) unitEl.value = "";
persist(); renderAll();
toast(`✅ Босс "${boss.name}" создан AI!`);
} catch(error) {
toastAIError(error);
}
});
}
}

/* ===== js\storage.js ===== */
"use strict";

/**
 * Platform-agnostic storage boundary — Stage 1 complete (v3.5.0).
 *
 * Contract:
 * - WebStorageAdapter  — synchronous primary for browser + compatibility fallback
 * - IndexedDBStorageAdapter — durable secondary mirror (verified writes)
 * - NativePreferencesStorageAdapter — durable primary on Capacitor/Android
 *
 * StorageService provides:
 *   save / load / remove / exists
 *   saveAsync / load paths with native preference
 *   IndexedDB mirror + compare + restore
 *   Native Preferences read/write
 *
 * Save format integrity, versioning, migrations, size limits and safety
 * backups live in js/save.js (SAVE_SCHEMA_VERSION, checksum, SAFETY_BACKUP_KEY).
 */

class WebStorageAdapter {
    constructor(storage = window.localStorage) {
        this.storage = storage;
    }

    getItem(key) { return this.storage.getItem(key); }
    setItem(key, value) { this.storage.setItem(key, value); }
    removeItem(key) { this.storage.removeItem(key); }
    hasItem(key) { return this.storage.getItem(key) !== null; }
}

class IndexedDBStorageAdapter {
    constructor({ dbName = 'the-creed-of-life', storeName = 'keyValue', version = 1 } = {}) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this._dbPromise = null;
    }

    isSupported() {
        return typeof window !== 'undefined' && !!window.indexedDB;
    }

    open() {
        if (!this.isSupported()) {
            return Promise.reject(new Error('IndexedDB API недоступен'));
        }
        if (this._dbPromise) return this._dbPromise;

        this._dbPromise = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Не удалось открыть IndexedDB'));
            request.onblocked = () => reject(new Error('IndexedDB заблокирована другой вкладкой'));
        });

        return this._dbPromise;
    }

    async getItem(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const request = tx.objectStore(this.storeName).get(key);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error || new Error('IndexedDB read failed'));
        });
    }

    async setItem(key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).put(value, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
            tx.onabort = () => reject(tx.error || new Error('IndexedDB write aborted'));
        });
    }

    async removeItem(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).delete(key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed'));
            tx.onabort = () => reject(tx.error || new Error('IndexedDB delete aborted'));
        });
    }

    async hasItem(key) {
        const value = await this.getItem(key);
        return value !== null && value !== undefined;
    }
}

class NativePreferencesStorageAdapter {
    constructor() {
        this.preferences = null;
        this.ready = false;
        this.error = null;
    }

    isSupported() {
        return !!(typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences);
    }

    async initialize() {
        if (!this.isSupported()) return false;
        this.preferences = window.Capacitor.Plugins.Preferences;
        this.ready = true;
        this.error = null;
        return true;
    }

    async getItem(key) {
        if (!this.ready && !(await this.initialize())) return null;
        const result = await this.preferences.get({ key });
        return result && typeof result.value === 'string' ? result.value : null;
    }

    async setItem(key, value) {
        if (!this.ready && !(await this.initialize())) throw new Error('Capacitor Preferences недоступен');
        await this.preferences.set({ key, value: String(value) });
        return true;
    }

    async removeItem(key) {
        if (!this.ready && !(await this.initialize())) throw new Error('Capacitor Preferences недоступен');
        await this.preferences.remove({ key });
        return true;
    }

    async hasItem(key) {
        return (await this.getItem(key)) !== null;
    }
}

function createStorageAdapter() {
    if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('Web Storage API недоступен');
    }
    return new WebStorageAdapter(window.localStorage);
}

const StorageService = (() => {
    let adapter = null;
    let indexedDBAdapter = null;
    let indexedDBReady = false;
    let indexedDBError = null;
    // Serialize all IndexedDB mutations so rapid autosaves cannot complete
    // out of order and leave the mirror older than the latest local save.
    let indexedDBWriteChain = Promise.resolve();
    let nativeAdapter = null;
    let nativeReady = false;
    let nativeError = null;

    function getNativeAdapter() {
        if (!nativeAdapter) nativeAdapter = new NativePreferencesStorageAdapter();
        return nativeAdapter;
    }

    async function initializeNative() {
        try {
            nativeReady = await getNativeAdapter().initialize();
            nativeError = null;
            return nativeReady;
        } catch (error) {
            nativeReady = false;
            nativeError = error;
            console.warn('Native Preferences initialization failed:', error);
            return false;
        }
    }

    function getAdapter() {
        if (!adapter) adapter = createStorageAdapter();
        return adapter;
    }

    function getIndexedDBAdapter() {
        if (!indexedDBAdapter) indexedDBAdapter = new IndexedDBStorageAdapter();
        return indexedDBAdapter;
    }

    async function mirrorToIndexedDBAndWait(key, value) {
        const idb = getIndexedDBAdapter();
        await idb.setItem(key, value);
        const verified = await idb.getItem(key);
        if (verified !== value) throw new Error('IndexedDB verification failed');
        indexedDBReady = true;
        indexedDBError = null;
        return true;
    }

    function mirrorToIndexedDB(key, value) {
        const idb = getIndexedDBAdapter();
        indexedDBWriteChain = indexedDBWriteChain
            .catch(() => {})
            .then(() => idb.setItem(key, value))
            .then(() => { indexedDBReady = true; indexedDBError = null; })
            .catch(error => {
                indexedDBError = error;
                console.warn('IndexedDB mirror failed:', error);
            });
    }

    function mirrorRemoveFromIndexedDB(key) {
        const idb = getIndexedDBAdapter();
        indexedDBWriteChain = indexedDBWriteChain
            .catch(() => {})
            .then(() => idb.removeItem(key))
            .then(() => { indexedDBReady = true; indexedDBError = null; })
            .catch(error => {
                indexedDBError = error;
                console.warn('IndexedDB mirror remove failed:', error);
            });
    }

    async function initializeIndexedDB(key) {
        const idb = getIndexedDBAdapter();
        if (!idb.isSupported()) {
            indexedDBError = new Error('IndexedDB API недоступен');
            return false;
        }

        try {
            await idb.open();
            const localValue = getAdapter().getItem(key);
            const indexedValue = await idb.getItem(key);

            // localStorage remains authoritative. Only an empty IndexedDB
            // record is seeded automatically. If both records exist but
            // differ, do not overwrite either one: leave the discrepancy for
            // the diagnostic/recovery layer to handle explicitly.
            if (localValue !== null && (indexedValue === null || indexedValue === undefined)) {
                await idb.setItem(key, localValue);
            }

            indexedDBReady = true;
            indexedDBError = null;
            return true;
        } catch (error) {
            indexedDBError = error;
            console.warn('IndexedDB initialization failed:', error);
            return false;
        }
    }

    return Object.freeze({
        save(key, value) {
            // Fast compatibility path. Critical operations use saveAsync(),
            // which waits for the durable backend and verifies the write.
            getAdapter().setItem(key, value);
            if (getNativeAdapter().isSupported()) {
                getNativeAdapter().setItem(key, value).then(() => {
                    nativeReady = true;
                    nativeError = null;
                }).catch(error => {
                    nativeError = error;
                    console.warn('Native Preferences write failed:', error);
                });
            } else {
                mirrorToIndexedDB(key, value);
            }
            return true;
        },

        async saveAsync(key, value) {
            if (typeof value !== 'string') throw new TypeError('StorageService.saveAsync expects a string');

            if (getNativeAdapter().isSupported()) {
                await getNativeAdapter().setItem(key, value);
                nativeReady = true;
                nativeError = null;
                const verified = await getNativeAdapter().getItem(key);
                if (verified !== value) throw new Error('Native Preferences verification failed');
                getAdapter().setItem(key, value);
                return true;
            }

            getAdapter().setItem(key, value);
            const idb = getIndexedDBAdapter();
            if (idb.isSupported()) {
                await mirrorToIndexedDBAndWait(key, value);
            }
            return true;
        },

        load(key) {
            return getAdapter().getItem(key);
        },

        // Synchronous fallback write used only to keep localStorage aligned
        // with the IndexedDB record selected during startup. It does not
        // trigger another IndexedDB mirror write.
        setLocalOnly(key, value) {
            getAdapter().setItem(key, value);
        },

        remove(key) {
            getAdapter().removeItem(key);
            if (getNativeAdapter().isSupported()) {
                getNativeAdapter().removeItem(key).catch(error => console.warn('Native Preferences remove failed:', error));
            }
            mirrorRemoveFromIndexedDB(key);
            return true;
        },

        async removeAsync(key) {
            if (getNativeAdapter().isSupported()) {
                await getNativeAdapter().removeItem(key);
                const remaining = await getNativeAdapter().getItem(key);
                if (remaining !== null) throw new Error('Native Preferences remove verification failed');
                getAdapter().removeItem(key);
                return true;
            }
            getAdapter().removeItem(key);
            if (getIndexedDBAdapter().isSupported()) {
                await getIndexedDBAdapter().removeItem(key);
            }
            return true;
        },

        exists(key) {
            return getAdapter().hasItem(key);
        },

        initializeIndexedDB,

        async readIndexedDB(key) {
            try {
                const value = await getIndexedDBAdapter().getItem(key);
                indexedDBReady = true;
                indexedDBError = null;
                return value;
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB read failed:', error);
                return null;
            }
        },

        async compareIndexedDB(key) {
            try {
                const localValue = getAdapter().getItem(key);
                const indexedValue = await getIndexedDBAdapter().getItem(key);
                indexedDBReady = true;
                indexedDBError = null;
                return {
                    localExists: localValue !== null,
                    indexedExists: indexedValue !== null && indexedValue !== undefined,
                    matches: localValue === indexedValue,
                    localValue,
                    indexedValue
                };
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB comparison failed:', error);
                return {
                    localExists: getAdapter().getItem(key) !== null,
                    indexedExists: false,
                    matches: false,
                    localValue: getAdapter().getItem(key),
                    indexedValue: null,
                    error: error.message || String(error)
                };
            }
        },

        async restoreFromIndexedDB(key) {
            try {
                const indexedValue = await getIndexedDBAdapter().getItem(key);
                if (indexedValue === null || indexedValue === undefined) {
                    return { restored: false, reason: 'empty' };
                }
                getAdapter().setItem(key, indexedValue);
                indexedDBReady = true;
                indexedDBError = null;
                return { restored: true, value: indexedValue };
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB restore failed:', error);
                return { restored: false, reason: 'error', error: error.message || String(error) };
            }
        },

        async initializeNative() { return initializeNative(); },

        async readNative(key) {
            try {
                const value = await getNativeAdapter().getItem(key);
                nativeReady = true;
                nativeError = null;
                return value;
            } catch (error) {
                nativeError = error;
                nativeReady = false;
                console.warn('Native Preferences read failed:', error);
                return null;
            }
        },

        nativeStatus() {
            return {
                supported: getNativeAdapter().isSupported(),
                ready: nativeReady,
                error: nativeError ? String(nativeError.message || nativeError) : null
            };
        },

        indexedDBStatus() {
            return {
                supported: getIndexedDBAdapter().isSupported(),
                ready: indexedDBReady,
                error: indexedDBError ? String(indexedDBError.message || indexedDBError) : null
            };
        }
    });
})();

/* ===== js\save.js ===== */
"use strict";

let persistTimeout = null;

// Save format version. Version 0 is the legacy raw state; v1 is the
// first envelope; v2 is the current envelope with integrity checksum.
const SAVE_FORMAT = "TCOL_SAVE";
const SAVE_SCHEMA_VERSION = 2;
// Last-resort local copy created automatically before import/reset.
// Separate key so a bad import cannot overwrite the only recovery path.
const SAFETY_BACKUP_KEY = STORAGE_KEY + "-safety";
const MAX_SAVE_BYTES = 900 * 1024;
const SAVE_COLLECTION_LIMITS = Object.freeze({
    plannedQuests: 100, activeQuests: 50, completedQuests: QUEST_COMPLETED_MAX,
    bosses: 200, inventory: 500, shop: 200, craftRecipes: 200,
    achievements: 500, perksUnlocked: 200, perksAvailable: 20, buffs: 100, debuffs: 100,
    coinLog: 40, journal: 500,
});

function utf8ByteLength(text) {
    return new TextEncoder().encode(String(text)).length;
}

function enforceSaveCollectionLimits(parsed) {
    const trimTail = (value, max) => Array.isArray(value) && value.length > max ? value.slice(-max) : (Array.isArray(value) ? value : []);
    const trimHead = (value, max) => Array.isArray(value) && value.length > max ? value.slice(0, max) : (Array.isArray(value) ? value : []);

    if (parsed.quests) {
        parsed.quests.planned = trimTail(parsed.quests.planned, SAVE_COLLECTION_LIMITS.plannedQuests);
        parsed.quests.active = trimTail(parsed.quests.active, SAVE_COLLECTION_LIMITS.activeQuests);
        parsed.quests.completed = trimTail(parsed.quests.completed, SAVE_COLLECTION_LIMITS.completedQuests);
    }
    parsed.bosses = trimTail(parsed.bosses, SAVE_COLLECTION_LIMITS.bosses);
    parsed.inventory = trimTail(parsed.inventory, SAVE_COLLECTION_LIMITS.inventory);
    parsed.shop = trimTail(parsed.shop, SAVE_COLLECTION_LIMITS.shop);
    parsed.craftRecipes = trimTail(parsed.craftRecipes, SAVE_COLLECTION_LIMITS.craftRecipes);
    parsed.achievements = trimTail(parsed.achievements, SAVE_COLLECTION_LIMITS.achievements);
    parsed.perksUnlocked = trimTail(parsed.perksUnlocked, SAVE_COLLECTION_LIMITS.perksUnlocked);
    parsed.perksAvailable = trimHead(parsed.perksAvailable, SAVE_COLLECTION_LIMITS.perksAvailable);
    parsed.buffs = trimTail(parsed.buffs, SAVE_COLLECTION_LIMITS.buffs);
    parsed.debuffs = trimTail(parsed.debuffs, SAVE_COLLECTION_LIMITS.debuffs);
    parsed.coinLog = trimTail(parsed.coinLog, SAVE_COLLECTION_LIMITS.coinLog);

    const journalCutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    parsed.journal = Array.isArray(parsed.journal)
        ? parsed.journal.filter(ev => ev && typeof ev === 'object' && Number(ev.ts) > journalCutoff).slice(0, SAVE_COLLECTION_LIMITS.journal)
        : [];
    return parsed;
}

function assertSaveSize(envelope) {
    const data = JSON.stringify(envelope);
    const bytes = utf8ByteLength(data);
    if (bytes > MAX_SAVE_BYTES) {
        throw new Error(`Сейв слишком большой (${Math.round(bytes / 1024)} КБ). Уменьшите историю или инвентарь.`);
    }
    return { data, bytes };
}

function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((out, key) => {
            out[key] = canonicalize(value[key]);
            return out;
        }, {});
    }
    return value;
}

function checksumForState(state) {
    const input = JSON.stringify(canonicalize(state));
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

function createSaveEnvelope(gameState) {
    const normalizedState = enforceSaveCollectionLimits(gameState);
    const envelope = {
        format: SAVE_FORMAT,
        version: SAVE_SCHEMA_VERSION,
        appVersion: (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '3.7.4'),
        savedAt: new Date().toISOString(),
        checksum: checksumForState(normalizedState),
        state: normalizedState
    };
    assertSaveSize(envelope);
    return envelope;
}

function saveGame({ showIndicator = false } = {}) {
    try {
        const envelope = createSaveEnvelope(GameState.snapshot() || state);
        const { data } = assertSaveSize(envelope);
        StorageService.save(STORAGE_KEY, data);
        stateDirty = false;
        if (showIndicator) showSaveIndicator(true);
        return true;
    } catch (e) {
        console.error('Save failed:', e);
        return false;
    }
}

async function saveGameDurable({ showIndicator = false } = {}) {
    const envelope = createSaveEnvelope(GameState.snapshot() || state);
    const { data } = assertSaveSize(envelope);
    await StorageService.saveAsync(STORAGE_KEY, data);
    stateDirty = false;
    if (showIndicator) showSaveIndicator(true);
    return true;
}

function parseSavePayload(parsed) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Сейв должен быть JSON-объектом');
    }

    if (parsed.format === SAVE_FORMAT && parsed.state && typeof parsed.state === 'object') {
        const version = Number.isInteger(parsed.version) ? parsed.version : 0;
        if (version > SAVE_SCHEMA_VERSION) {
            throw new Error(`Сейв создан в более новой версии (${version}). Обновите игру.`);
        }
        if (version >= 2) {
            if (typeof parsed.checksum !== 'string' || parsed.checksum !== checksumForState(parsed.state)) {
                throw new Error('Сейв повреждён или был изменён');
            }
        }
        return { version, state: parsed.state };
    }

    return { version: 0, state: parsed };
}

function migrateSavePayload(parsed) {
    const payload = parseSavePayload(parsed);
    let migrated = payload.state;

    if (payload.version === 0) {
        migrated = migrateState(migrated, { legacyAchievements: true });
    } else if (payload.version === 1) {
        migrated = migrateState(migrated, { legacyAchievements: false });
    } else if (payload.version === 2) {
        migrated = migrateState(migrated, { legacyAchievements: false });
    }

    return migrated;
}

function migrateState(parsed, { legacyAchievements = false } = {}) {
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Сейв должен быть JSON-объектом');
    if (!parsed.character || typeof parsed.character !== 'object') throw new Error('Отсутствует character');
    const toInt = (v, fallback = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? Math.trunc(n) : fallback;
    };
    
    parsed.character.level = Math.max(1, toInt(parsed.character.level, 1));
    parsed.character.heroXP = Math.max(0, toInt(parsed.character.heroXP, 0));
    parsed.character.coins = Math.max(0, toInt(parsed.character.coins, 0));
    // Legacy migration: older saves used skillPoints for perk points.
    // Do this BEFORE normalizing perkPoints, otherwise the missing field
    // would be created as 0 and the legacy value would be lost.
    if (parsed.character.perkPoints === undefined && parsed.character.skillPoints !== undefined) {
        parsed.character.perkPoints = Math.max(0, toInt(parsed.character.skillPoints, 0));
        delete parsed.character.skillPoints;
    }
    parsed.character.perkPoints = Math.max(0, toInt(parsed.character.perkPoints, 0));
    parsed.character.specialPoints = Math.max(0, toInt(parsed.character.specialPoints, 0));
    parsed.character.perkGenLevel = Math.max(1, toInt(parsed.character.perkGenLevel, parsed.character.level));
    parsed.character.perkGenCount = Math.max(0, toInt(parsed.character.perkGenCount, 0));
    parsed.character.craftGenLevel = Math.max(1, toInt(parsed.character.craftGenLevel, parsed.character.level));
    parsed.character.craftGenCount = Math.max(0, toInt(parsed.character.craftGenCount, 0));
    parsed.character.name = typeof parsed.character.name === 'string' ? parsed.character.name.slice(0, 100) : '';
    if (!parsed.skills || typeof parsed.skills !== 'object') throw new Error('Отсутствует skills');
    if (!parsed.quests || typeof parsed.quests !== 'object') throw new Error('Отсутствует quests');
    parsed.quests.planned = Array.isArray(parsed.quests.planned) ? parsed.quests.planned : [];
    parsed.quests.active = Array.isArray(parsed.quests.active) ? parsed.quests.active : [];
    parsed.quests.completed = Array.isArray(parsed.quests.completed) ? parsed.quests.completed : [];
    if (parsed.quests.completed.length > QUEST_COMPLETED_MAX) parsed.quests.completed = parsed.quests.completed.slice(-QUEST_COMPLETED_MAX);
    const questRecords = [...parsed.quests.planned, ...parsed.quests.active, ...parsed.quests.completed]
        .filter(q => q && typeof q === 'object' && !Array.isArray(q));
    let maxQuestId = 0;
    questRecords.forEach(q => {
        delete q.total;
        delete q.progress;
        const id = Number(q.id);
        if (Number.isSafeInteger(id) && id > 0) {
            q.id = id;
            maxQuestId = Math.max(maxQuestId, id);
        } else {
            delete q.id;
        }
    });
    parsed.nextQuestId = Math.max(1, toInt(parsed.nextQuestId, 1), maxQuestId + 1);
    questRecords.forEach(q => {
        if (q.id === undefined) q.id = allocateQuestId(parsed);
    });
    if (!parsed.quests.stats || typeof parsed.quests.stats !== 'object') parsed.quests.stats = { completed:0, failed:0, aborted:0 };
    parsed.quests.stats.completed = Math.max(0, Number(parsed.quests.stats.completed) || 0);
    parsed.quests.stats.failed = Math.max(0, Number(parsed.quests.stats.failed) || 0);
    parsed.quests.stats.aborted = Math.max(0, Number(parsed.quests.stats.aborted) || 0);
    if (!Array.isArray(parsed.bosses)) parsed.bosses = [];
    if (!Array.isArray(parsed.inventory)) parsed.inventory = [];
    if (!Array.isArray(parsed.shop)) parsed.shop = [];
    parsed.shop = parsed.shop.map(item => {
        if (!item || typeof item !== 'object') return item;
        const price = Number(item.price);
        item.price = Number.isFinite(price) ? Math.max(0, Math.trunc(price)) : 30;
        return item;
    }).filter(Boolean);
    if (!Array.isArray(parsed.craftRecipes)) parsed.craftRecipes = [];
    if (!parsed.settings || typeof parsed.settings !== 'object') parsed.settings = { theme:'nature', soundEnabled:true };
    if (parsed.settings.soundEnabled === undefined) parsed.settings.soundEnabled = true;
    if (parsed.settings.notificationsEnabled === undefined) parsed.settings.notificationsEnabled = true;
    if (parsed.settings.aiTheme === 'dark_fantasy') parsed.settings.aiTheme = 'fantasy';
    if (parsed.settings.aiTheme === 'cozy') parsed.settings.aiTheme = 'real_world';
    if (typeof AI_THEME_OPTIONS === 'undefined' ||
        !Object.prototype.hasOwnProperty.call(AI_THEME_OPTIONS, parsed.settings.aiTheme)) {
      parsed.settings.aiTheme = 'real_world';
    }
    // Hybrid AI (free limit + own key)
    if (parsed.settings.aiMode !== 'free' && parsed.settings.aiMode !== 'own_key') {
      parsed.settings.aiMode = 'free';
    }
    if (parsed.settings.aiOwnKey !== null && typeof parsed.settings.aiOwnKey !== 'string') {
      parsed.settings.aiOwnKey = null;
    }
    if (typeof parsed.settings.aiFreeUsed !== 'number' || parsed.settings.aiFreeUsed < 0) {
      parsed.settings.aiFreeUsed = 0;
    }
    if (typeof parsed.settings.aiFreeWindowStart !== 'number') {
      parsed.settings.aiFreeWindowStart = 0;
    }
    if (typeof parsed.settings.aiDailyFreeLimit !== 'number' || parsed.settings.aiDailyFreeLimit < 1) {
      parsed.settings.aiDailyFreeLimit = 10;
    }
    parsed.settings.aiProvider = 'tooken';
    if (typeof AI_MODEL_OPTIONS === 'undefined' ||
        !Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, parsed.settings.aiModel)) {
      parsed.settings.aiModel = 'deepseek-v4-flash';
    }
    if (!parsed.todayStats || typeof parsed.todayStats !== 'object') parsed.todayStats = { quests:0, coins:0, xp:0, activitySeconds:0, date:null };
    if (parsed.todayStats.activitySeconds === undefined) parsed.todayStats.activitySeconds = 0;
    if (parsed.totalActivitySeconds === undefined) parsed.totalActivitySeconds = 0;
    // v3.3.3: при миграции действительно старого (version 0) сейва
    // заменяем старую систему достижений новой. Для актуальных version 1
    // сейвов существующий прогресс достижений сохраняется.
    const oldAchievementStats = (parsed.achievementStats && typeof parsed.achievementStats === 'object') ? parsed.achievementStats : {};
    parsed.achievementStats = {
        coinsEarned: Math.max(0, Number(oldAchievementStats.coinsEarned) || 0),
        attributeUpgrades: Math.max(0, Number(oldAchievementStats.attributeUpgrades) || 0),
        consumablesUsed: Math.max(0, Number(oldAchievementStats.consumablesUsed) || 0),
        inventoryItemsObtained: Math.max(0, Number(oldAchievementStats.inventoryItemsObtained) || 0),
        equipmentUniqueNames: Array.isArray(oldAchievementStats.equipmentUniqueNames) ? [...new Set(oldAchievementStats.equipmentUniqueNames.filter(Boolean))] : []
    };
    // Для старых сейвов восстанавливаем только то, что можно определить без догадок.
    if (!parsed.achievementStats.attributeUpgrades && parsed.special && typeof parsed.special === 'object') {
        parsed.achievementStats.attributeUpgrades = Object.values(parsed.special).reduce((sum, value) => sum + Math.max(0, toInt(value, 0) - 5), 0);
    }
    if (!parsed.achievementStats.inventoryItemsObtained) {
        parsed.achievementStats.inventoryItemsObtained = parsed.inventory.reduce((sum, item) => sum + Math.max(0, toInt(item?.qty, 1)), 0);
    }
    if (!parsed.achievementStats.equipmentUniqueNames.length) {
        const names = [];
        Object.values(parsed.equipment || {}).forEach(item => { if (item?.name) names.push(item.name); });
        parsed.inventory.forEach(item => { if (item?.type === 'equipment' && item?.name) names.push(item.name); });
        Object.values(parsed.accessories || {}).forEach(items => (Array.isArray(items) ? items : []).forEach(item => { if (item?.name) names.push(item.name); }));
        parsed.achievementStats.equipmentUniqueNames = [...new Set(names)];
    }
    // Только legacy version 0 начинает новую систему достижений с нуля.
    // Актуальный version 1 не должен терять уже накопленные достижения при загрузке.
    if (legacyAchievements || !Array.isArray(parsed.achievements)) {
        parsed.achievements = typeof createAchievementState === 'function' ? createAchievementState() : [];
    }
    if (!Array.isArray(parsed.perksUnlocked)) parsed.perksUnlocked = [];
    if (!Array.isArray(parsed.perksAvailable)) parsed.perksAvailable = [];
    if (!parsed.unlocks || typeof parsed.unlocks !== 'object') parsed.unlocks = {};
    if (!Array.isArray(parsed.debuffs)) parsed.debuffs = [];
    if (parsed.raidActive) parsed.raidTotalMinutes = Math.min(RAID_MAX_MINUTES, Math.max(1, toInt(parsed.raidTotalMinutes, RAID_MAX_MINUTES)));
    parsed.debuffs = parsed.debuffs.filter(d => d && typeof d === 'object' && Number(d.expiresAt) > Date.now()).map(d => ({
        id: typeof d.id === 'string' ? d.id : ('debuff-' + Math.random().toString(36).slice(2)),
        source: typeof d.source === 'string' ? d.source : 'quest',
        name: typeof d.name === 'string' ? d.name : 'Слабость',
        effect: typeof d.effect === 'string' ? d.effect : '',
        startsAt: Number(d.startsAt) || Date.now(),
        expiresAt: Number(d.expiresAt) || Date.now(),
        heroMultiplier: Number.isFinite(Number(d.heroMultiplier)) ? Number(d.heroMultiplier) : 1,
        coinMultiplier: Number.isFinite(Number(d.coinMultiplier)) ? Number(d.coinMultiplier) : 1,
        skillMultiplier: Number.isFinite(Number(d.skillMultiplier)) ? Number(d.skillMultiplier) : 1,
        stack: Math.max(1, toInt(d.stack, 1))
    }));
    if (!parsed.raidStartTime && parsed.raidActive) parsed.raidStartTime = Date.now();
    parsed.bosses.forEach(b => {
        if (!b || typeof b !== 'object') return;
        if (!b.bossType) b.bossType = 'financial';
        if (!b.unit) b.unit = b.bossType === 'financial' ? '₽' : 'ед.';
        if (!b.createdAt) b.createdAt = Date.now();
        if (!Array.isArray(b.phases)) b.phases = [];
        b.target = Math.max(0, toInt(b.target, 0));
        b.phases.forEach(p => {
            if (!p || typeof p !== 'object') return;
            p.progress = Math.max(0, toInt(p.progress, 0));
            p.target = Math.max(0, toInt(p.target, 0));
            if (p.defeated === undefined) p.defeated = false;
            if (p.applied === undefined) p.applied = !!p.defeated;
        });
    });
    if (!parsed.activeBossId && parsed.bosses.length) parsed.activeBossId = parsed.bosses[0].id;
    const SKILL_MIGRATION_MAP = {
        "🔧 Практические навыки":"🛠️ Ручной труд", "🧠 Технологии":"💻 Технологии", "🎯 Концентрация":"🧘 Концентрация",
        "🛡️ Выносливость":"🏋️ Выносливость", "🧩 Анализ":"🔍 Анализ", "🧩 Решение проблем":"🔍 Анализ",
        "🗣️ Социальные навыки":"🗣️ Коммуникация", "⚖️ Ответственность":"🎯 Ответственность", "📋 Дисциплина":"📋 Менеджмент"
    };
    const migrateSkillsObject = skills => {
        if (!skills || typeof skills !== 'object') return {};
        const result = {};
        Object.entries(skills).forEach(([oldName,xp]) => { const newName=SKILL_MIGRATION_MAP[oldName]||oldName; result[newName]=(result[newName]||0)+(Number(xp)||0); });
        return result;
    };
    // Незавершённый новый профиль: имя ещё не задано — SPECIAL всегда должен оставаться 0.
    // Это также очищает пустые профили, сохранённые предыдущими версиями с неверными стартовыми значениями.
    if (!String(parsed.character?.name || "").trim() && parsed.special && typeof parsed.special === "object") {
        Object.keys(parsed.special).forEach(k => { parsed.special[k] = 0; });
    }
    if (parsed.special && typeof parsed.special === 'object') {
        Object.keys(parsed.special).forEach(k => {
            parsed.special[k] = Math.max(0, toInt(parsed.special[k], 0));
        });
    }
    parsed.skills = migrateSkillsObject(parsed.skills);
    // Добавляем новые навыки в старые сохранения без изменения существующего прогресса.
    if (typeof SKILL_NAMES !== 'undefined') {
        SKILL_NAMES.forEach(name => {
            if (!(name in parsed.skills)) parsed.skills[name] = 0;
        });
    }
    const migrateReward = reward => { if (reward && typeof reward==='object') reward.skills=migrateSkillsObject(reward.skills); };
    [...parsed.quests.planned,...parsed.quests.active].forEach(q => { if (!q || typeof q!=='object') return; migrateReward(q.reward); migrateReward(q.bonus); migrateReward(q.bonusPerExtra); });
    if (parsed.character.specialPoints === undefined) parsed.character.specialPoints=0;
    if (parsed.character.perkGenLevel === undefined) { parsed.character.perkGenLevel=parsed.character.level; parsed.character.perkGenCount=0; }
    parsed.perksAvailable.forEach(p => { if (p.effect===undefined) p.effect=''; if (p.condition===undefined) p.condition=null; });
    const RETIRED_PERK_NAMES=["💪 Рабочие руки I","👁️ Наблюдатель","💪 Рабочие руки II","🧠 Аналитик","💰 Экономный","🛡️ Стойкость"];
    parsed.perksUnlocked=parsed.perksUnlocked.filter(p=>!RETIRED_PERK_NAMES.includes(typeof p==='string'?p:p.name));
    parsed.perksAvailable=parsed.perksAvailable.filter(p=>!RETIRED_PERK_NAMES.includes(p.name));
    if (!parsed.accessories || typeof parsed.accessories!=='object') {
        const freshEquipment={'Голова':null,'Тело':null,'Тело верхняя':null,'Ноги':null,'Ступни':null,'Обувь':null,'Рюкзак':null};
        const freshAccessories={'Запястье (левое)':[],'Запястье (правое)':[],'Пальцы':[],'Шея':[],'Гаджет':[]};
        const legacy=[];
        if (parsed.equipment && typeof parsed.equipment==='object') Object.entries(parsed.equipment).forEach(([oldSlot,item])=>{if(item) legacy.push({...item,__oldSlot:oldSlot});});
        (parsed.gearEveryday||[]).forEach(g=>legacy.push({...g,__oldSlot:g.slot})); (parsed.gearSpecial||[]).forEach(g=>legacy.push({...g,__oldSlot:g.slot}));
        legacy.forEach(g=>{
            const newSlot=SLOT_MAP_OLD_TO_NEW[g.__oldSlot]||'Пальцы', desc=g.desc||g.attrs||'', effect=g.effect||g.trait||'', rarity=g.rarity||'common';
            const condition=EQUIPMENT_CONDITION_ALIASES[g.condition] || (g.conditionTier==='pristine'?'perfect':g.conditionTier==='worn'?'worn':g.conditionTier==='heavy'?'damaged':(g.condition || 'good'));
            const item={name:g.name||'Предмет',desc,effect,rarity,condition,slot:newSlot,itemLevel:Math.max(1, Number(parsed.character?.level)||1)};
            if(isAccessorySlot(newSlot)) freshAccessories[newSlot].push(item); else if(!freshEquipment[newSlot]) freshEquipment[newSlot]=item; else parsed.inventory.push({id:'item_migrated_'+Date.now()+'_'+Math.floor(Math.random()*10000),...item,type:'equipment',qty:1,quote:'',source:'legacy'});
        });
        parsed.equipment=freshEquipment; parsed.accessories=freshAccessories; delete parsed.gearEveryday; delete parsed.gearSpecial;
    }
    const equipmentDefaults={'Голова':null,'Тело':null,'Тело верхняя':null,'Ноги':null,'Ступни':null,'Обувь':null,'Рюкзак':null};
    const accessoryDefaults={'Запястье (левое)':[],'Запястье (правое)':[],'Пальцы':[],'Шея':[],'Гаджет':[]};
    parsed.equipment={...equipmentDefaults,...(parsed.equipment||{})}; parsed.accessories={...accessoryDefaults,...(parsed.accessories||{})};
    Object.keys(parsed.accessories).forEach(slot=>{if(!Array.isArray(parsed.accessories[slot])) parsed.accessories[slot]=[];});
    parsed.inventory.forEach(it=>{if(!it||typeof it!=='object')return; if(it.type==='equipment'){if(it.slot&&!ALL_SLOTS.includes(it.slot))it.slot=SLOT_MAP_OLD_TO_NEW[it.slot]||'Пальцы'; it.condition=EQUIPMENT_CONDITION_ALIASES[it.condition]||'good'; it.itemLevel=Math.max(1, Math.floor(Number(it.itemLevel)||Number(parsed.character?.level)||1));} if(!it.qty||it.qty<1)it.qty=1;});
    const normalizeEquipmentPower = item => {
        if (!item || item.type === 'material' || item.type === 'consumable') return;
        item.condition = EQUIPMENT_CONDITION_ALIASES[item.condition] || 'good';
        item.itemLevel = Math.max(1, Math.floor(Number(item.itemLevel)||Number(parsed.character?.level)||1));
        const base = EQUIPMENT_POWER_BY_RARITY[item.rarity] || EQUIPMENT_POWER_BY_RARITY.common;
        const condition = EQUIPMENT_CONDITION_MULTIPLIER[item.condition] || 1;
        const slot = ACCESSORY_SLOTS.includes(item.slot) ? 0.90 : 1.00;
        const level = 1 + (item.itemLevel - 1) * 0.10;
        item.power = Math.max(1, Math.round(base * condition * slot * level));
    };
    Object.values(parsed.equipment || {}).forEach(normalizeEquipmentPower);
    Object.values(parsed.accessories || {}).forEach(items => (Array.isArray(items) ? items : []).forEach(normalizeEquipmentPower));
    parsed.inventory.forEach(normalizeEquipmentPower);
    if (!Array.isArray(parsed.activeEffects)) parsed.activeEffects = [];
    Object.entries(parsed.equipment || {}).forEach(([slot,item]) => {
        if (item && item.effect && !item.effectId) item.effectId = `equip_migrated_${slot}_${Math.random().toString(36).slice(2,10)}`;
    });
    Object.values(parsed.accessories || {}).forEach(items => (Array.isArray(items) ? items : []).forEach(item => {
        if (item && item.effect && !item.effectId) item.effectId = `equip_migrated_${Math.random().toString(36).slice(2,10)}`;
    }));
    if (!Array.isArray(parsed.buffs)) parsed.buffs = [];
    parsed.buffs = parsed.buffs.filter(b => b && typeof b === 'object' && Number(b.expiresAt) > Date.now());
    if (!Array.isArray(parsed.journal)) parsed.journal = [];
const journalCutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
parsed.journal = parsed.journal.filter(ev => ev && typeof ev === 'object' && Number(ev.ts) > journalCutoff);
if (parsed.journal.length > 500) parsed.journal.length = 500;
    if (!Array.isArray(parsed.shop)) parsed.shop = [];
    // Канонические стартовые расходники: если старый сейв уже существует,
    // восстанавливаем их редкость/баффы по имени. Это чинит сейвы, где
    // предыдущая миграция уже успела записать всем common. Пользовательские
    // товары с другими именами не трогаем.
    const canonicalConsumables = {
        '☕ Кофе растворимый': { rarity:'common', effect:'+5% к концентрации', durationMinutes:30, quote:'Бодрость в каждой чашке' },
        '☕🥛 Кофе растворимый с молоком': { rarity:'uncommon', effect:'+5% к концентрации +3% к продуктивности', durationMinutes:30, quote:'Мягкая энергия' },
        '🍵 Чай из пакетика': { rarity:'common', effect:'+3% к коммуникации', durationMinutes:20, quote:'Тёплый разговор' },
        '⚡ Банка энергетика': { rarity:'rare', effect:'+8% к продуктивности', durationMinutes:45, secondaryEffect:'После окончания баффа: -3% к концентрации на 15 мин', secondaryDurationMinutes:15, quote:'Взлёт и падение' }
    };
    parsed.shop.forEach(item => {
        if (!item || typeof item !== 'object') return;
        const canonical = canonicalConsumables[item.name];
        if (canonical) Object.assign(item, canonical);
        if (!RARITY_ORDER.includes(item.rarity)) item.rarity = item.type === 'consumable' ? rollConsumableRarity() : 'common';
        if (item.effect && item.durationMinutes === undefined) item.durationMinutes = 30;
        if (item.durationMinutes !== undefined) item.durationMinutes = normalizeConsumableDuration(item.durationMinutes, 30);
    });
    parsed.inventory.forEach(item => {
        if (!item || typeof item !== 'object') return;
        if (item.type === 'consumable') {
            if (!RARITY_ORDER.includes(item.rarity)) item.rarity = rollConsumableRarity();
            item.durationMinutes = normalizeConsumableDuration(item.durationMinutes, 30);
            item.secondaryEffect = item.secondaryEffect || '';
            item.secondaryDurationMinutes = item.secondaryDurationMinutes ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15) : 0;
        }
    });
    // Единый реестр активных эффектов собирается из расходников, дебаффов и экипировки.
    // Старые массивы buffs/debuffs сохраняются для совместимости с игровой логикой.
    if (typeof syncLegacyEffects === 'function') {
        const previousState = state;
        try { state = parsed; syncLegacyEffects(); } finally { state = previousState; }
    }
    return parsed;
}

function loadGameFromRaw(raw){
    if (!raw) return false;
    const migrated = migrateSavePayload(JSON.parse(raw));
    GameState.replace(migrated);
    return true;
}

function loadGame(){
    try {
        return loadGameFromRaw(StorageService.load(STORAGE_KEY));
    }
    catch(e){ console.error("Load failed:",e); return false; }
}

// v3.4.31: IndexedDB becomes the preferred persistent source at startup.
// localStorage remains a synchronous fallback and a compatibility backup.
async function loadGameAsync(){
    try {
        await StorageService.initializeNative();
        const nativeRaw = await StorageService.readNative(STORAGE_KEY);
        const localRaw = StorageService.load(STORAGE_KEY);
        const indexedRaw = await StorageService.readIndexedDB(STORAGE_KEY);

        // Android native storage is authoritative when a valid record exists.
        if (nativeRaw) {
            try {
                const loaded = loadGameFromRaw(nativeRaw);
                if (loaded) {
                    StorageService.setLocalOnly(STORAGE_KEY, nativeRaw);
                    return true;
                }
            } catch (nativeError) {
                console.warn('Native save rejected, falling back:', nativeError);
            }
        }

        if (!indexedRaw) {
            return loadGameFromRaw(localRaw);
        }

        // Validate both candidates before choosing between them. This keeps a
        // malformed IndexedDB record from ever replacing a valid local save.
        let localEnvelope = null;
        let indexedEnvelope = null;
        try { if (localRaw) localEnvelope = parseSavePayload(JSON.parse(localRaw)); } catch (_) {}
        try { indexedEnvelope = parseSavePayload(JSON.parse(indexedRaw)); } catch (_) {}

        let selectedRaw = null;
        if (indexedEnvelope && !localEnvelope) {
            selectedRaw = indexedRaw;
        } else if (indexedEnvelope && localEnvelope) {
            const localTime = localEnvelope.version > 0 && localRaw ? Date.parse((JSON.parse(localRaw).exportedAt || '')) : NaN;
            const indexedTime = indexedRaw ? Date.parse((JSON.parse(indexedRaw).exportedAt || '')) : NaN;
            // If timestamps are unavailable or equal, prefer IndexedDB.
            selectedRaw = Number.isFinite(localTime) && Number.isFinite(indexedTime) && localTime > indexedTime
                ? localRaw
                : indexedRaw;
        } else if (localEnvelope) {
            selectedRaw = localRaw;
        }

        if (!selectedRaw) return false;
        const loaded = loadGameFromRaw(selectedRaw);

        // Keep the synchronous fallback aligned with the source actually used.
        if (loaded && selectedRaw !== localRaw) {
            try { StorageService.setLocalOnly(STORAGE_KEY, selectedRaw); }
            catch (syncError) { console.warn('Local fallback sync failed:', syncError); }
        }
        return loaded;
    } catch (e) {
        console.error('Async save load failed:', e);
        return loadGame();
    }
}

// v3.4.29: IndexedDB remains a secondary mirror. Startup compares it with
// localStorage but never replaces the authoritative local save automatically.
async function initializeIndexedDBMirror() {
    try {
        const initialized = await StorageService.initializeIndexedDB(STORAGE_KEY);
        if (!initialized) return;

        const comparison = await StorageService.compareIndexedDB(STORAGE_KEY);
        if (!comparison.matches) {
            if (comparison.localExists && comparison.indexedExists) {
                console.warn('IndexedDB/localStorage save mismatch detected. localStorage remains authoritative; no automatic replacement performed.');
            } else if (!comparison.localExists && comparison.indexedExists) {
                console.warn('IndexedDB contains a recoverable save while localStorage is empty. No automatic restore performed.');
            }
        } else if (comparison.localExists) {
            console.info('IndexedDB save check: OK, records match.');
        }
    } catch (e) {
        console.warn('IndexedDB startup check skipped:', e);
    }
}

const SaveService = Object.freeze({
    save: saveGame,
    load: loadGame,
    loadAsync: loadGameAsync,
    remove() {
        try {
            createSafetyBackup("remove");
            StorageService.remove(STORAGE_KEY);
            stateDirty = false;
            return true;
        } catch (e) {
            console.error("Remove save failed:", e);
            return false;
        }
    },
    async removeDurable() {
        try {
            await createSafetyBackupAsync("remove");
            await StorageService.removeAsync(STORAGE_KEY);
            stateDirty = false;
            return true;
        } catch (e) {
            console.error("Durable remove failed:", e);
            return false;
        }
    },
    exists() {
        try {
            return StorageService.exists(STORAGE_KEY);
        } catch (e) {
            console.error("Check save failed:", e);
            return false;
        }
    },
    async checkIndexedDB() {
        return StorageService.compareIndexedDB(STORAGE_KEY);
    },
    async restoreFromIndexedDB() {
        try {
            const indexedRaw = await StorageService.readIndexedDB(STORAGE_KEY);
            if (!indexedRaw) return { restored: false, reason: 'empty' };

            // Never write the IndexedDB copy into localStorage before the
            // complete payload has been parsed and migrated successfully.
            let parsed;
            let migrated;
            try {
                parsed = JSON.parse(indexedRaw);
                migrated = migrateSavePayload(parsed);
            } catch (error) {
                console.error('IndexedDB recovery validation failed:', error);
                return { restored: false, reason: 'invalid', error: error.message || String(error) };
            }

            if (!migrated || !migrated.character || !migrated.skills || !migrated.quests) {
                return { restored: false, reason: 'invalid', error: 'Неверная структура резервного сейва' };
            }

            const previousRaw = StorageService.load(STORAGE_KEY);

            try {
                StorageService.save(STORAGE_KEY, indexedRaw);
                const loaded = loadGame();
                if (!loaded) throw new Error('Не удалось загрузить восстановленный сейв');

                stateDirty = false;
                return { restored: true };
            } catch (error) {
                // Roll back the previous local save if the final load failed.
                try {
                    if (previousRaw === null || previousRaw === undefined) {
                        StorageService.remove(STORAGE_KEY);
                    } else {
                        StorageService.save(STORAGE_KEY, previousRaw);
                    }
                } catch (rollbackError) {
                    console.error('IndexedDB recovery rollback failed:', rollbackError);
                }
                return { restored: false, reason: 'rollback', error: error.message || String(error) };
            }
        } catch (error) {
            console.error('IndexedDB recovery failed:', error);
            return { restored: false, reason: 'error', error: error.message || String(error) };
        }
    }
});

async function restoreSaveFromIndexedDB() {
    const result = await SaveService.restoreFromIndexedDB();
    if (result.restored) {
        renderAll();
        toast('✅ Сейв восстановлен из резервной копии');
        return true;
    }

    if (result.reason === 'empty') {
        toast('ℹ️ Резервная копия IndexedDB не найдена');
    } else if (result.reason === 'invalid') {
        toast('⚠️ Резервная копия повреждена или имеет неверный формат');
    } else {
        toast('⚠️ Не удалось восстановить сейв');
    }
    return false;
}


function createSafetyBackup(reason = "manual") {
    try {
        if (typeof flushPendingSave === "function") flushPendingSave(false);
        const snapshot = (typeof GameState !== "undefined" && GameState.snapshot)
            ? GameState.snapshot()
            : state;
        if (!snapshot || typeof snapshot !== "object" || !snapshot.character) {
            return false;
        }
        const cloned = JSON.parse(JSON.stringify(snapshot));
        if (!cloned.character || !cloned.skills || !cloned.quests) return false;
        const envelope = createSaveEnvelope(cloned);
        envelope.safetyBackup = {
            reason: String(reason || "manual"),
            createdAt: new Date().toISOString()
        };
        StorageService.save(SAFETY_BACKUP_KEY, JSON.stringify(envelope));
        return true;
    } catch (e) {
        console.error("Safety backup failed:", e);
        return false;
    }
}

async function createSafetyBackupAsync(reason = "manual") {
    try {
        if (typeof flushPendingSave === "function") flushPendingSave(false);
        const snapshot = (typeof GameState !== "undefined" && GameState.snapshot)
            ? GameState.snapshot() : state;
        if (!snapshot || typeof snapshot !== "object" || !snapshot.character) return false;
        const cloned = JSON.parse(JSON.stringify(snapshot));
        if (!cloned.character || !cloned.skills || !cloned.quests) return false;
        const envelope = createSaveEnvelope(cloned);
        envelope.safetyBackup = { reason: String(reason || "manual"), createdAt: new Date().toISOString() };
        const { data } = assertSaveSize(envelope);
        await StorageService.saveAsync(SAFETY_BACKUP_KEY, data);
        return true;
    } catch (e) {
        console.error("Durable safety backup failed:", e);
        return false;
    }
}

function hasSafetyBackup() {
    try {
        return StorageService.exists(SAFETY_BACKUP_KEY);
    } catch (_) {
        return false;
    }
}

async function restoreSafetyBackup() {
    try {
        const raw = StorageService.load(SAFETY_BACKUP_KEY);
        if (!raw) { toast("Локальная резервная копия отсутствует"); return false; }
        const migrated = migrateSavePayload(JSON.parse(raw));
        if (!migrated || !migrated.character || !migrated.skills || !migrated.quests) throw new Error("Резервная копия повреждена");

        // Restoring is itself destructive: preserve the current state in a
        // second durable backup before replacing it.
        const protectedCurrent = await createSafetyBackupAsync("before-restore");
        if (!protectedCurrent) throw new Error("Не удалось защитить текущий сейв перед восстановлением");

        GameState.replace(migrated);
        await saveGameDurable();
        renderAll();
        toast("Сейв восстановлен из локальной резервной копии");
        return true;
    } catch (e) {
        console.error("Safety backup restore failed:", e);
        toast("Не удалось восстановить резервную копию");
        return false;
    }
}

async function resetToDefault() {
    const backedUp = await createSafetyBackupAsync("reset");
    if (!backedUp) {
        toast("⚠️ Не удалось создать резервную копию. Сброс отменён.");
        return false;
    }
    GameState.replace(defaultState());
    await saveGameDurable();
    renderAll();
    toast("Сейв сброшен. Предыдущий прогресс сохранён в резервной копии.");
    return true;
}

async function exportSave() {
    const fileName = `life-rpg-save-${new Date().toISOString().slice(0,10)}.json`;
    try {
        const snapshot = GameState.snapshot();
        if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('Состояние игры недоступно для экспорта');
        }

        const parsedSnapshot = JSON.parse(JSON.stringify(snapshot));
        if (!parsedSnapshot.character || !parsedSnapshot.skills || !parsedSnapshot.quests) {
            throw new Error('Текущее состояние имеет неверный формат');
        }

        const envelope = createSaveEnvelope(parsedSnapshot);
        const data = JSON.stringify(envelope, null, 2);
        if (!data || data.length < 10) {
            throw new Error('Сформирован пустой файл сейва');
        }

        // Final round-trip check before touching the device filesystem.
        migrateSavePayload(JSON.parse(data));
        await downloadSaveFile(data, fileName);
    } catch (e) {
        console.error('Export failed:', e);
        toast('⚠️ Не удалось экспортировать сейв');
    }
}

function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

async function downloadSaveFile(data, fileName) {
    const capacitor = window.Capacitor;
    const isNative = !!(capacitor && typeof capacitor.isNativePlatform === 'function' && capacitor.isNativePlatform());

    if (isNative) {
        try {
            // This project uses plain JavaScript (no bundler). In Capacitor 8,
            // native plugins are exposed through the global plugin registry.
            const plugins = capacitor.Plugins || {};
            const Filesystem = plugins.Filesystem;
            const Share = plugins.Share;

            if (!Filesystem || !Share) {
                throw new Error('Capacitor Filesystem/Share plugins are not available');
            }
            const base64Data = utf8ToBase64(data);

            // Keep a persistent copy on the device first.
            await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: 'DOCUMENTS',
                recursive: true
            });

            // Open the Android share/file sheet so the user can copy the save
            // to Downloads, a file manager, cloud storage, etc.
            const uriResult = await Filesystem.getUri({
                directory: 'DOCUMENTS',
                path: fileName
            });

            await Share.share({
                title: fileName,
                dialogTitle: 'Сохранить сейв',
                files: [uriResult.uri]
            });

            toast('Сейв экспортирован');
            return;
        } catch (e) {
            console.error('Native save export failed:', e);
            throw e;
        }
    }

    // Browser fallback.
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    if (!blob.size) throw new Error('Пустой файл сейва');

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        try { a.remove(); } catch (_) {}
        try { URL.revokeObjectURL(url); } catch (_) {}
    }, 3000);

    toast('Сейв экспортирован');
}

function importSave(file) {
    if (!file) {
        toast("Файл сейва не выбран");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const migrated = migrateSavePayload(data);
            if (!migrated || !migrated.character || !migrated.skills || !migrated.quests) {
                throw new Error("Неверный формат сейва");
            }

            // Current progress is snapshotted before any state replacement.
            const backedUp = await createSafetyBackupAsync("import");
            if (!backedUp) throw new Error("Не удалось создать резервную копию текущего прогресса");

            // Migrate first, then replace the root state only after the
            // complete save has passed validation. This prevents a broken
            // import from partially replacing the current game state.
            GameState.replace(migrated);

            if (!(await saveGameDurable())) {
                throw new Error("Не удалось записать импортированный сейв");
            }

            renderAll();
            toast("Сейв импортирован. Предыдущий прогресс сохранён в локальной резервной копии.");
        } catch (err) {
            const msg = (err && err.message) ? String(err.message) : "Ошибка импорта";
            toast("Ошибка импорта: " + msg);
            console.error("Import failed:", err);
        } finally {
            // Allow selecting the same file again after a failed import.
            const input = document.getElementById('importFile');
            if (input) input.value = '';
        }
    };
    reader.onerror = () => {
        toast("Ошибка чтения файла");
        console.error("Import read failed:", reader.error);
        const input = document.getElementById('importFile');
        if (input) input.value = '';
    };
    reader.readAsText(file);
}

function showSaveIndicator(saving) {
const el = document.getElementById('saveIndicator');
if (!el) return;
clearTimeout(autosaveTimeout);
el.classList.toggle('saving', !!saving);
el.innerHTML = '<span class="save-icon">💾</span><span class="save-status-dot" aria-hidden="true"></span>';
if (saving) {
  el.classList.remove('save-pulse');
  void el.offsetWidth;
  el.classList.add('save-pulse');
  autosaveTimeout = setTimeout(() => {
    el.classList.remove('saving');
    el.classList.remove('save-pulse');
  }, 700);
}
}

function persist() {
stateDirty = true;
clearTimeout(persistTimeout);
persistTimeout = setTimeout(() => {
  persistTimeout = null;
  SaveService.save({ showIndicator: true });
}, 300);
}

function flushPendingSave(showIndicator = false) {
clearTimeout(persistTimeout);
persistTimeout = null;
if (stateDirty) SaveService.save({ showIndicator });
}

function getAutosaveSecondsRemaining(){
const remaining = Math.max(0, autosaveNextAt - Date.now());
return Math.ceil(remaining / 1000);
}

function showAutosaveCountdown(){
toast(`Автосохранение через: ${getAutosaveSecondsRemaining()} сек.`);
}

function wireSaveIndicator(){
const el = document.getElementById("saveIndicator");
if (!el || el.dataset.wired === "1") return;
el.dataset.wired = "1";
el.style.pointerEvents = "auto";
el.style.cursor = "pointer";
el.setAttribute("role", "button");
el.setAttribute("tabindex", "0");
el.addEventListener("click", showAutosaveCountdown);
el.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showAutosaveCountdown();
  }
});
}

async function refreshIndexedDBRecoveryButton() {
    const btn = document.getElementById('restoreIndexedDBBtn');
    const status = document.getElementById('indexedDBSaveStatus');
    if (!btn) return;

    btn.disabled = true;
    if (status) status.textContent = 'Проверка резервной копии...';

    try {
        const comparison = await SaveService.checkIndexedDB();
        const hasBackup = comparison.indexedExists;
        btn.disabled = !hasBackup;

        if (status) {
            if (!comparison.indexedExists) status.textContent = 'Резервная копия IndexedDB отсутствует';
            else if (!comparison.localExists) status.textContent = 'Найдена резервная копия — локальный сейв отсутствует';
            else if (comparison.matches) status.textContent = 'Резервная копия актуальна';
            else status.textContent = 'Найдена резервная копия, отличающаяся от локального сейва';
        }
    } catch (error) {
        btn.disabled = true;
        if (status) status.textContent = 'IndexedDB недоступна';
    }
}

function wireIndexedDBRecovery() {
    const btn = document.getElementById('restoreIndexedDBBtn');
    if (!btn || btn.dataset.wired === '1') return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => {
        showConfirm(
            '♻️ Восстановить сейв',
            'Текущий локальный сейв будет заменён резервной копией IndexedDB. Продолжить?',
            async () => {
                btn.disabled = true;
                await restoreSaveFromIndexedDB();
                await refreshIndexedDBRecoveryButton();
            }
        );
    });
    refreshIndexedDBRecoveryButton();
}

function wireExportImport(){
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const restoreSafetyBtn = document.getElementById('restoreSafetyBackupBtn');

if (exportBtn) exportBtn.addEventListener('click', exportSave);

if (importBtn) {
    importBtn.addEventListener('click', () => {
        if (importFile) importFile.click();
    });
}

if (importFile) {
    importFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        // Reset input early so the same file can be chosen again later.
        e.target.value = '';
        if (!file) return;

        showConfirm(
            '⬆️ Загрузить сейв',
            'Текущий прогресс будет заменён данными из файла. Перед заменой автоматически создастся локальная резервная копия. Продолжить?',
            () => importSave(file)
        );
    });
}

if (restoreSafetyBtn && restoreSafetyBtn.dataset.wired !== '1') {
    restoreSafetyBtn.dataset.wired = '1';
    restoreSafetyBtn.addEventListener('click', () => {
        if (!hasSafetyBackup()) {
            toast('Локальная резервная копия отсутствует');
            return;
        }
        showConfirm(
            '♻️ Откатить к резервной копии',
            'Текущий сейв будет заменён последней локальной копией, созданной перед импортом или сбросом. Продолжить?',
            () => restoreSafetyBackup()
        );
    });
}
}

// v3.4.28: begin background IndexedDB mirror initialization.
initializeIndexedDBMirror();
setTimeout(wireIndexedDBRecovery, 0);

/* ===== js\journal-core.js ===== */
"use strict";


/*
 * Journal Core
 * Игровая логика журнала событий не зависит от DOM и UI.
 */
const JournalCore = (() => {
  const MAX = 500;
  const MAX_AGE_DAYS = 60;

  function ensure() {
    if (!Array.isArray(S().journal)) S().journal = [];
    return S().journal;
  }

  function logEvent(type, icon, text, meta) {
    const journal = ensure();
    const event = {
      id: 'ev_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      type: type || 'other',
      ts: Date.now(),
      icon: icon || '•',
      text: text || '',
      meta: meta || null
    };
    journal.unshift(event);
    if (journal.length > MAX) journal.length = MAX;
    return event;
  }

  function prune(now = Date.now()) {
    const journal = ensure();
    const cutoff = now - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const before = journal.length;
    S().journal = journal.filter(ev => ev && ev.ts > cutoff);
    if (S().journal.length > MAX) S().journal.length = MAX;
    return before !== S().journal.length;
  }

  function clear() {
    S().journal = [];
    return true;
  }

  return {
    MAX,
    MAX_AGE_DAYS,
    logEvent,
    prune,
    clear
  };
})();

function logEvent(type, icon, text, meta) {
  return JournalCore.logEvent(type, icon, text, meta);
}

/* ===== js\character.js ===== */
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

/* ===== js\buffs.js ===== */
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

/* ===== js\skills.js ===== */
"use strict";


// Связка SPECIAL → навыки. Каждый атрибут отвечает ровно за два навыка.
const SPECIAL_SKILL_LINKS = {
    '💪 Сила': ['💪 Физическая форма', '🛠️ Ручной труд'],
    '👁️ Восприятие': ['🔍 Анализ', '💻 Технологии'],
    '🛡️ Выносливость': ['🏋️ Выносливость', '🧭 Выживание'],
    '🗣️ Харизма': ['🗣️ Коммуникация', '👑 Лидерство'],
    '🧠 Интеллект': ['🧘 Концентрация', '📋 Менеджмент'],
    '⚡ Ловкость': ['⚡ Продуктивность', '🎯 Ответственность'],
    '🎲 Удача': ['💰 Финансы', '🎨 Творчество'],
};

const SKILL_SPECIAL_MAP = Object.entries(SPECIAL_SKILL_LINKS).reduce((map, [special, skills]) => {
    skills.forEach(skill => { map[skill] = special; });
    return map;
}, {});

function getSkillSpecial(skillName){
    return SKILL_SPECIAL_MAP[skillName] || null;
}

// Базовое значение SPECIAL = 5 → ×1.00. Каждый дополнительный пункт
// постоянно увеличивает получаемый XP связанного навыка на 5%.
function getSkillMultiplier(skillName){
    const specialKey = getSkillSpecial(skillName);
    if (!specialKey) return 1;
    const value = typeof getEffectiveSpecialValue === 'function' ? Number(getEffectiveSpecialValue(specialKey)) : Number(state?.special?.[specialKey]);
    if (!Number.isFinite(value)) return 1;
    return Math.max(0.5, 1 + (value - 5) * 0.05);
}

function formatSkillMultiplier(multiplier){
    return `×${Number(multiplier).toFixed(2)}`;
}

/* ===== js\perks-core.js ===== */
"use strict";


/*
 * Perks Core — game logic only.
 * No DOM, no rendering, no UI events.
 */
const PerksCore = (() => {
    const MAX_AVAILABLE = 3;
    const MAX_GENERATIONS_PER_LEVEL = 3;

    function ensureState() {
        if (!S().character || typeof S().character !== 'object') throw new Error('Character state is missing');
        if (!Array.isArray(S().perksUnlocked)) S().perksUnlocked = [];
        if (!Array.isArray(S().perksAvailable)) S().perksAvailable = [];
        if (!Number.isFinite(Number(S().character.perkGenLevel))) S().character.perkGenLevel = S().character.level || 1;
        if (!Number.isFinite(Number(S().character.perkGenCount))) S().character.perkGenCount = 0;
    }

    function syncGenerationLevel() {
        ensureState();
        const level = Math.max(1, Number(S().character.level) || 1);
        if (Number(S().character.perkGenLevel) !== level) {
            S().character.perkGenLevel = level;
            S().character.perkGenCount = 0;
            return true;
        }
        return false;
    }

    function resetGenerationForLevel(level = S().character.level) {
        ensureState();
        S().character.perkGenLevel = Math.max(1, Number(level) || 1);
        S().character.perkGenCount = 0;
    }

    function getGenerationCount() {
        ensureState();
        return Math.max(0, Number(S().character.perkGenCount) || 0);
    }

    function getGenerationLimit() {
        return MAX_GENERATIONS_PER_LEVEL;
    }

    function canGenerate() {
        syncGenerationLevel();
        return getGenerationCount() < MAX_GENERATIONS_PER_LEVEL;
    }

    function getAvailableLimit() {
        return MAX_AVAILABLE;
    }

    function addGenerated(perk, replaceIdx = null) {
        ensureState();
        if (!perk || typeof perk !== 'object') throw new Error('Invalid perk');
        if (!canGenerate()) return { ok: false, reason: 'generation_limit' };

        if (replaceIdx !== null && S().perksAvailable[replaceIdx] !== undefined) {
            S().perksAvailable[replaceIdx] = perk;
        } else {
            if (S().perksAvailable.length >= MAX_AVAILABLE) {
                return { ok: false, reason: 'available_limit' };
            }
            S().perksAvailable.push(perk);
        }

        S().character.perkGenCount = getGenerationCount() + 1;
        return { ok: true, count: S().character.perkGenCount };
    }

    function replaceAvailable(index, perk) {
        ensureState();
        if (!Number.isInteger(index) || index < 0 || index >= S().perksAvailable.length) return false;
        if (!perk || typeof perk !== 'object') return false;
        S().perksAvailable[index] = perk;
        return true;
    }

    function canUnlock(perk, conditionMet = true) {
        ensureState();
        if (!perk || typeof perk !== 'object') return { ok: false, reason: 'invalid_perk' };
        if (!conditionMet) return { ok: false, reason: 'condition' };
        const cost = Math.max(0, Number(perk.cost) || 0);
        if (getPerkPoints() < cost) return { ok: false, reason: 'points' };
        return { ok: true, cost };
    }

    function getPerkPoints() {
        ensureState();
        return Math.max(0, Number(S().character.perkPoints) || 0);
    }

    function unlock(index, conditionMet = true) {
        ensureState();
        if (!Number.isInteger(index) || index < 0 || index >= S().perksAvailable.length) {
            return { ok: false, reason: 'invalid_index' };
        }
        const perk = S().perksAvailable[index];
        const check = canUnlock(perk, conditionMet);
        if (!check.ok) return check;

        S().character.perkPoints -= check.cost;
        S().perksUnlocked.push({
            name: perk.name,
            effects: perk.effects || (perk.effect ? [perk.effect] : []),
            isSuper: !!perk.isSuper
        });
        S().perksAvailable.splice(index, 1);
        return { ok: true, perk };
    }

    return Object.freeze({
        MAX_AVAILABLE,
        MAX_GENERATIONS_PER_LEVEL,
        ensureState,
        syncGenerationLevel,
        resetGenerationForLevel,
        getGenerationCount,
        getGenerationLimit,
        canGenerate,
        getAvailableLimit,
        addGenerated,
        replaceAvailable,
        canUnlock,
        getPerkPoints,
        unlock
    });
})();

/* ===== js\perks.js ===== */
"use strict";

const MAX_AVAILABLE_PERKS = PerksCore.MAX_AVAILABLE;

const SUPER_PERK_CHANCE = 0.15; // 15% шанс на сверхсильный перк при каждой генерации

function showPerkSlotChoice(perks, onChoose){
const existing = document.querySelector('.confirm-overlay');
if (existing) existing.remove();
const overlay = document.createElement('div');
overlay.className = 'confirm-overlay';
const optionsHtml = perks.map((p, i) => `
<button class="btn warn" data-slotidx="${i}" style="display:block; width:100%; text-align:left; margin-bottom:6px; white-space:normal;">
${i+1}. ${escapeHtml(p.name || 'Без названия')}${p.desc ? ` — ${escapeHtml(p.desc)}` : ''}
</button>
`).join('');
overlay.innerHTML = `
<div class="confirm-box">
<h3>🔄 Освободить слот перка</h3>
<p>Уже сгенерировано максимум перков (3/3), которые ещё не куплены. Выбери, какой из них заменить новым:</p>
<div style="margin:10px 0;">${optionsHtml}</div>
<div class="actions">
<button class="btn" id="confirmCancel">Отмена</button>
</div>
</div>
`;
document.body.appendChild(overlay);
overlay.querySelectorAll('[data-slotidx]').forEach(btn => btn.addEventListener('click', () => {
overlay.remove();
onChoose(Number(btn.dataset.slotidx));
}));
overlay.querySelector('#confirmCancel').addEventListener('click', () => overlay.remove());
overlay.addEventListener('click', (e) => {
if (e.target === overlay) overlay.remove();
});
}

function checkPerkCondition(perk){
if (!perk.condition) return true;
const { type, key, min } = perk.condition;
const value = type === 'special' ? (state.special[key] || 0) : (state.skills[key] || 0);
return value >= min;
}

function perkConditionText(perk){
if (!perk.condition) return '';
const { key, min } = perk.condition;
return `${key} ≥ ${min}`;
}

function renderPerks(){
const elPoints = document.getElementById("perkPointsSub");
const elGenCount = document.getElementById("perkGenCountSub");
const elUnlocked = document.getElementById("unlockedPerks");
const elAvailable = document.getElementById("availablePerks");
if (elPoints) elPoints.textContent = state.character.perkPoints;
if (elGenCount) elGenCount.textContent = state.character.perkGenCount;
if (elUnlocked) {
elUnlocked.innerHTML = state.perksUnlocked.map(p=>{
const name = typeof p === 'string' ? p : p.name;
const effects = typeof p === 'string' ? [] : (p.effects || []);
const isSuper = typeof p !== 'string' && p.isSuper;
const effectsHtml = effects.map(e => `<div class="trait">✨ ${escapeHtml(e)}</div>`).join('');
return `<div class="sub" style="margin-bottom:8px;">🔓 <b style="color:var(--phosphor-bright)">${isSuper ? '🌟 ' : ''}${escapeHtml(name)}</b>${effectsHtml}</div>`;
}).join("") || `<div class="empty">Пусто</div>`;
}
if (elAvailable) {
elAvailable.innerHTML = "";
state.perksAvailable.forEach((perk, idx)=>{
const met = checkPerkCondition(perk);
const canAfford = state.character.perkPoints >= perk.cost;
const effectsList = perk.effects && perk.effects.length ? perk.effects : (perk.effect ? [perk.effect] : []);
const effectsHtml = effectsList.map(e => `<div class="trait">✨ ${escapeHtml(e)}</div>`).join('');
const row = document.createElement("div");
row.className = "quest";
row.innerHTML = `
<div class="qh"><span class="title">${perk.isSuper ? '🌟 ' : ''}${escapeHtml(perk.name)}${perk.isSuper ? ' <span class="badge raid">СВЕРХСИЛЬНЫЙ</span>' : ''}</span><span class="qid">${perk.cost}⭐</span></div>
<div class="desc">${escapeHtml(perk.desc)}</div>
${effectsHtml}
${perk.condition ? `<div class="sub">Условие: ${perkConditionText(perk)}</div>` : ''}
<div class="sub">Статус: ${met ? '✅ Доступен' : '🔒 Условие не выполнено'}</div>
<div class="actions"><button class="btn primary" data-idx="${idx}" ${(met && canAfford) ? '' : 'disabled'}>Разблокировать</button></div>
`;
row.querySelector("button").addEventListener("click", async ()=>{
if(!checkPerkCondition(perk)){ toast("Условие для этого перка ещё не выполнено"); return; }
if(state.character.perkPoints < perk.cost){ toast("Недостаточно очков перков"); return; }
const unlockResult = PerksCore.unlock(idx, true);
if (!unlockResult.ok) {
if (unlockResult.reason === "points") toast("Недостаточно очков перков");
return;
}
if (typeof syncAchievements === 'function') syncAchievements();
logEvent('perk', '⭐', `Разблокирован перк: ${perk.name}`);
persist(); renderAll();
toast(`Перк разблокирован: ${perk.name}`);
});
elAvailable.appendChild(row);
});
if(!state.perksAvailable.length) elAvailable.innerHTML = `<div class="empty">Нет доступных перков</div>`;
}
}

async function generatePerkWithAI(isSuper, bonusCount){
const skillList = Object.entries(state.skills).map(([k,v])=>`${k}: ${v} XP`).join(', ');
const specialList = Object.entries(state.special).map(([k,v])=>`${k}: ${v}`).join(', ');
const specialKeys = Object.keys(state.special);
if (isSuper) {
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\nТы — генератор редкого сверхсильного пассивного перка. Условие обязательно: существующий навык или SPECIAL. Навыки: ${SKILL_NAMES.join(', ')}. SPECIAL: ${specialKeys.join(', ')}. Ровно ${bonusCount} разных effects. Сила идёт за счёт количества, а не больших чисел.\nJSON: {"name":"название с эмодзи","desc":"1-2 предложения","effects":["бонус 1"],"conditionType":"skill","conditionKey":"🔧 Практические навыки","conditionMin":150}\nconditionMin обычно 150-350 для навыка или 8-10 для SPECIAL. Верни только JSON.`;
return await queryAI(`Создай редкий сверхсильный перк. Текущие навыки: ${skillList}. Текущие SPECIAL: ${specialList}.`, systemPrompt);
}
const systemPrompt = `${NO_THINKING_RULE}\n${AI_WORLD_RULE}\n${AI_DESIGN_RULE}\n${AI_REALISM_RULE}\n${AI_EFFECT_RULE}\nТы — генератор обычного пассивного перка. Условие обязательно и логично связано с существующим навыком или SPECIAL. Навыки: ${SKILL_NAMES.join(', ')}. SPECIAL: ${specialKeys.join(', ')}. Один короткий effect в пределах +1..+5 или 1-15%. Не используй XP, монеты или Мощь напрямую.\nJSON: {"name":"название с эмодзи","desc":"1-2 предложения","effect":"короткий эффект","conditionType":"skill","conditionKey":"🔧 Практические навыки","conditionMin":100,"cost":1}\nconditionMin: 20-300 для навыков или 6-10 для SPECIAL; cost 1-2. Верни только JSON.`;
return await queryAI(`Создай новый перк. Текущие навыки: ${skillList}. Текущие SPECIAL: ${specialList}.`, systemPrompt);
}

function wireAIPerkGeneration(){
const btn = document.getElementById('aiGeneratePerkBtn');
if (!btn) return;
btn.addEventListener('click', () => {
if (!aiAvailable) { toast('🤖 AI недоступен. Проверьте интернет-соединение.'); return; }
PerksCore.syncGenerationLevel();
if (!PerksCore.canGenerate()) {
toast(`Лимит генераций перков на этом уровне исчерпан (${PerksCore.getGenerationLimit()}/${PerksCore.getGenerationLimit()}) — повысь уровень для новых попыток.`);
return;
}
const runGeneration = async (replaceIdx) => {
// Розыгрыш редкого "сверхсильного" перка: 3-6 бонусов вместо одного,
// и цена сразу 2-4 очка перков (а не обычные 1-2).
const isSuper = Math.random() < SUPER_PERK_CHANCE;
const bonusCount = isSuper ? (3 + Math.floor(Math.random() * 4)) : 1; // 3..6
try {
const result = await withAIThinking(
isSuper ? '🌟 Придумываю сверхсильный перк...' : '🤖 Придумываю перк...',
() => generatePerkWithAI(isSuper, bonusCount)
);
const conditionType = result.conditionType === 'special' ? 'special' : 'skill';
const validKeys = conditionType === 'special' ? Object.keys(state.special) : SKILL_NAMES;
const conditionKey = validKeys.includes(result.conditionKey) ? result.conditionKey : validKeys[0];
const effects = isSuper
? (Array.isArray(result.effects) && result.effects.length ? result.effects.slice(0, 6) : ['✨ мощный эффект'])
: [result.effect || ''];
const perk = {
name: result.name || '✨ Новый перк',
desc: result.desc || '',
effects,
isSuper,
cost: isSuper ? (2 + Math.floor(Math.random() * 3)) : Math.max(1, Math.min(2, Number(result.cost) || 1)), // super: 2..4
condition: { type: conditionType, key: conditionKey, min: Number(result.conditionMin) || 10 }
};
// Слоты уже заняты (проверено ДО генерации) — заменяем выбранный,
// а не просто дописываем в конец, иначе после апдейта лимита их
// стало бы больше 3 при следующей генерации.
const addResult = PerksCore.addGenerated(perk, replaceIdx);
if (!addResult.ok) {
if (addResult.reason === "generation_limit") toast(`Лимит генераций перков на этом уровне исчерпан (${PerksCore.getGenerationLimit()}/${PerksCore.getGenerationLimit()}).`);
else if (addResult.reason === "available_limit") toast("Нет свободного слота для нового перка.");
return;
}
persist(); renderAll();
toast(isSuper
? `🌟 Выпал СВЕРХСИЛЬНЫЙ перк: ${perk.name} (${effects.length} бонусов)!`
: `✅ Перк сгенерирован: ${perk.name} (${PerksCore.getGenerationCount()}/${PerksCore.getGenerationLimit()} на этом уровне)`);
} catch(err) {
toastAIError(err);
}
};
// Максимум 3 сгенерированных, но ещё не купленных перка одновременно —
// если слоты уже заняты, сначала спрашиваем, какой освободить.
if (state.perksAvailable.length >= MAX_AVAILABLE_PERKS) {
showPerkSlotChoice(state.perksAvailable, (idx) => runGeneration(idx));
} else {
runGeneration(null);
}
});
}

/* ===== js\quest-core.js ===== */
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

function formatQuestId(id){
  return String(Number(id) || 0).padStart(3, '0');
}

function allocateQuestId(targetState = S()){
  const nextId = Number(targetState.nextQuestId);
  const id = Number.isSafeInteger(nextId) && nextId > 0 ? nextId : 1;
  targetState.nextQuestId = id + 1;
  return id;
}

function descriptionBonus(desc){
  const len = (desc || "").trim().length;
  return Math.min(DESC_XP_CAP, Math.round(len * DESC_XP_PER_CHAR));
}

function computeQuestReward(difficultyKey, minutes, skillKeys, desc){
  const tier = DIFFICULTY_TABLE[difficultyKey] || DIFFICULTY_TABLE.normal;
  const descBonus = descriptionBonus(desc);
  let heroXP = (tier.base + minutes * XP_PER_MINUTE + descBonus) * tier.mult;
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
  q.id = allocateQuestId();
  delete q.total;
  delete q.progress;
  q.type = 'рейд';
  S().quests.planned.push(q);
  return { ok:true, quest:q };
}

function startNewQuest(q) {
  if (!q || typeof q !== 'object') return { ok:false, reason:'invalid_quest' };
  if (!Array.isArray(S().quests.active)) S().quests.active = [];
  // Raids must be planned first, then started from the planned list.
  if (q.type === 'рейд') return { ok:false, reason:'raid_must_be_planned' };
  const quest = { ...q, id:allocateQuestId() };
  delete quest.total;
  delete quest.progress;
  S().quests.active.push(quest);
  return { ok:true, quest };
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
      { type:'quest', icon:'⚔️', text:`Выполнен квест #${formatQuestId(q.id)}: ${q.title}`, meta:{ questId:q.id } }
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

/* ===== js\quests.js ===== */
"use strict";

// UI-only formatting helper. Kept here instead of QuestCore because it is presentation logic.
function formatDebuffDuration(expiresAt){
  const ms = Math.max(0, Number(expiresAt||0) - Date.now());
  const h = Math.floor(ms / 3600000);
  const m = Math.ceil((ms % 3600000) / 60000);
  return h ? `${h}ч ${m}м` : `${m}м`;
}

function fmtMinutes(m){
  if(!m) return "";
  if(m < 60) return m + " мин";
  const h = Math.floor(m/60), mm = m % 60;
  return mm ? `${h}ч ${mm}м` : `${h}ч`;
}

function rewardGroups(reward){
  reward = reward || {};
  const xp = Number(reward.heroXP) || 0;
  const coins = Number(reward.coins) || 0;
  const skills = Object.entries(reward.skills || {}).filter(([,v]) => Number(v) || 0);
  const items = (reward.items || []).filter(it => it && it.name);
  return {xp, coins, skills, items};
}

function rewardPills(reward){
  const r = rewardGroups(reward);
  let html = '<div class="quest-rewards">';
  html += '<div class="quest-section-title">Награды:</div>';
  const main = [];
  if(r.xp) main.push(`<span class="pill reward-hero">⭐ +${r.xp} XP</span>`);
  if(r.coins) main.push(`<span class="pill reward-coin">🪙 +${r.coins}</span>`);
  if(main.length) html += `<div class="pill-row quest-reward-pill-row">${main.join('')}</div>`;
  if(r.skills.length){
    html += '<div class="quest-reward-label">Навыки:</div><div class="quest-reward-list">';
    r.skills.forEach(([k,v]) => { html += `<div>${escapeHtml(k)} - +${Number(v)||0} XP</div>`; });
    html += '</div>';
  }
  if(r.items.length){
    html += '<div class="quest-reward-label">Предметы:</div><div class="quest-reward-list">';
    r.items.forEach(item => {
      const qty = Number(item.quantity || item.count || 1) || 1;
      html += `<div>🎁 ${escapeHtml(item.name)}${qty > 1 ? ` ×${qty}` : ''}</div>`;
    });
    html += '</div>';
  }
  if(!r.xp && !r.coins && !r.skills.length && !r.items.length) html += '<div class="muted">Нет наград</div>';
  html += '</div>';
  return html;
}

function questMetaRow(q){
  const dm = diffMeta(q.difficulty);
  const diffKey = safeDifficulty(q.difficulty);
  let timeHtml = '';
  if (q.estMinutes) {
    const hours = Math.floor(q.estMinutes / 60);
    const minutes = q.estMinutes % 60;
    const time = hours ? (minutes ? `${hours}ч ${minutes}м` : `${hours}ч`) : `${minutes}м`;
    timeHtml = `<span class="pill time">⏱ ${time}</span>`;
  }
  return `<div class="pill-row quest-meta-pills"><span class="pill diff-${diffKey}">${dm.label}</span>${timeHtml}</div>`;
}

function questBadgeRow(q){ return questMetaRow(q); }

function showRaidStartConfirm(raid, onConfirm) {
const existing = document.querySelector('.raid-confirm-overlay');
if (existing) existing.remove();
const overlay = document.createElement('div');
overlay.className = 'raid-confirm-overlay';
overlay.innerHTML = `
<div class="raid-confirm-card">
<div class="raid-confirm-icon">⚔️</div>
<div class="raid-confirm-title">НАЧАЛО РЕЙДА</div>
<div class="raid-confirm-subtitle">ПОДТВЕРЖДЕНИЕ ОПЕРАЦИИ</div>
<div class="raid-confirm-line"></div>
<div class="raid-confirm-name">${escapeHtml(raid.title)}</div>
<div class="raid-confirm-text">После начала рейд станет активным и запустится его таймер. Выполнение обычных квестов будет ограничено до завершения рейда.</div>
<div class="raid-confirm-warning">⚠️ Убедись, что готов начать рейд.</div>
<div class="actions raid-confirm-actions">
<button class="btn" id="raidConfirmCancel">Отмена</button>
<button class="btn danger" id="raidConfirmOk">⚔️ Начать рейд</button>
</div>
</div>`;
document.body.appendChild(overlay);
const close = () => overlay.remove();
overlay.querySelector('#raidConfirmCancel').addEventListener('click', close);
overlay.querySelector('#raidConfirmOk').addEventListener('click', () => { close(); onConfirm(); });
overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

function renderQuests(){
const raidNotice = document.getElementById("raidNotice");
const planned = document.getElementById("questsPlanned");
const active = document.getElementById("questsActive");
const done = document.getElementById("questsDone");
if (raidNotice) {
raidNotice.textContent = state.raidActive
? "⚠️ Активен рабочий рейд — прочие активные квесты нельзя завершать, магазин только для просмотра."
: "Рейдов не активно.";
}
// Planned
if (planned) {
planned.innerHTML = "";
// Planned list is raids-only; drop any legacy non-raid entries from display index mapping
const plannedRaids = (state.quests.planned || []).map((q, idx) => ({ q, idx })).filter(x => x.q && x.q.type === "рейд");
const countEl = document.getElementById("countPlanned");
if (countEl) countEl.textContent = plannedRaids.length;
if(!plannedRaids.length) {
planned.innerHTML = `<div class="empty">Нет запланированных рейдов</div>`;
} else {
plannedRaids.forEach(({ q, idx })=>{
const div = document.createElement("div");
div.className = "quest quest-raid diff-" + (q.difficulty||"normal");
div.innerHTML = `
<div class="qh"><span class="title">${q.icon || "👹"} ${escapeHtml(q.title)} <span class="badge badge-raid">РЕЙД</span>${q.source === "ai" ? ' <span class="badge ai">AI</span>' : ""}</span><span class="qid">#${formatQuestId(q.id)}</span></div>
${questMetaRow(q)}
<div class="quest-desc"><div class="quest-section-title">Описание:</div><div class="quest-desc-text">${escapeHtml(q.desc)}</div></div>
${rewardPills(q.reward)}
<div class="actions"><button class="btn danger" data-idx="${idx}">⚔️ Начать рейд</button></div>
`;
div.querySelector("button").addEventListener("click", async ()=>{
const item = state.quests.planned[idx];
if (!item || item.type !== "рейд") { toast("В запланированных могут быть только рейды"); return; }
showRaidStartConfirm(item, () => {
const startedItem = QuestCore.startPlannedQuest(idx);
if (startedItem?.blocked) {
  toast(startedItem.reason === 'raid-active' ? '⚠️ Уже идёт рейд' : '⚠️ Рейд не может длиться больше 24 часов');
  return;
}
if (startedItem) {
  startRaidTimer();
  if (typeof Sound !== 'undefined') Sound.raidStart();
  persist(); renderAll();
  toast(`⚔️ Рейд начат: ${startedItem.title}`);
}
});
});
planned.appendChild(div);
});
}
}
// Active
if (active) {
active.innerHTML = "";
const countEl = document.getElementById("countActive");
if (countEl) countEl.textContent = state.quests.active.length;
if(!state.quests.active.length) {
active.innerHTML = `<div class="empty">Нет активных квестов</div>`;
} else {
state.quests.active.forEach((q, idx)=>{
const div = document.createElement("div");
const isRaid = q.type === "рейд";
const lockedByOtherRaid = state.raidActive && !isRaid;
const raidExpired = isRaid && typeof QuestCore !== "undefined" && typeof QuestCore.isRaidTimeExpired === "function" && QuestCore.isRaidTimeExpired(q);
const bonusNote = q.bonus ? q.bonus.desc : (q.bonusPerExtra ? q.bonusPerExtra.desc : "");
let actionsHtml;
if (isRaid) {
  if (raidExpired) {
    actionsHtml = `
<div class="actions raid-expired-actions">
<button class="btn primary" data-complete="${idx}">Выполнить</button>
<button class="btn danger" data-fail-raid="${idx}">Провалить</button>
</div>
<div class="bonus-note raid-expired-note">⏰ Время вышло. «Выполнить» — с наградой, «Провалить» — без награды (без дебаффа отмены).</div>`;
  } else {
    // Active raid cannot be completed early — only cancel (debuff) or wait for timer.
    actionsHtml = `
<div class="actions">
<button class="btn danger" data-abort="${idx}">Отменить рейд</button>
</div>
<div class="bonus-note">⏳ Рейд идёт. Завершить можно только после истечения таймера.</div>`;
  }
} else {
  actionsHtml = `
<div class="actions">
<button class="btn primary" data-complete="${idx}" ${lockedByOtherRaid ? "disabled":""}>Завершить</button>
${q.bonus ? `<button class="btn gold" data-bonus="${idx}" ${lockedByOtherRaid ? "disabled":""}>Завершить с бонусом</button>` : ""}
<button class="btn danger" data-abort="${idx}">Отменить</button>
</div>`;
}
div.className = "quest" + (isRaid ? " quest-raid" : "") + " diff-" + (q.difficulty||"normal");
div.innerHTML = `
<div class="qh"><span class="title">${q.icon} ${escapeHtml(q.title)}${isRaid ? ' <span class="badge badge-raid">РЕЙД</span>' : ""}${q.source === "ai" ? ' <span class="badge ai">AI</span>' : ""}${raidExpired ? ' <span class="badge" style="border-color:var(--red);color:var(--red)">время вышло</span>' : ""}</span><span class="qid">#${formatQuestId(q.id)}</span></div>
${questMetaRow(q)}
<div class="quest-desc"><div class="quest-section-title">Описание:</div><div class="quest-desc-text">${escapeHtml(q.desc)}</div></div>
${rewardPills(q.reward)}
${bonusNote ? `<div class="bonus-note">🎁 ${bonusNote}</div>` : ""}
${actionsHtml}
`;
const completeBtn = div.querySelector("[data-complete]");
if (completeBtn) completeBtn.addEventListener("click", ()=> completeQuest(idx, false));
const bonusBtn = div.querySelector("[data-bonus]");
if(bonusBtn) bonusBtn.addEventListener("click", ()=> completeQuest(idx, true));
const failRaidBtn = div.querySelector("[data-fail-raid]");
if (failRaidBtn) {
  failRaidBtn.addEventListener("click", () => {
    showConfirm(
      '⏰ Провалить рейд',
      `Время рейда «${q.title}» истекло.\n\nПровалить без награды? (штраф отмены не применяется)`,
      () => {
        const result = QuestCore.failExpiredRaid(idx);
        if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
        state._raidExpiredNotified = false;
        if (typeof clearRaidNotification === 'function') clearRaidNotification();
        const timerEl = document.getElementById('raidTimer');
        if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
        persist();
        renderAll();
        if (result && result.q) {
          if (typeof Sound !== 'undefined') Sound.fail();
          toast(`⏰ Рейд «${result.q.title}» провален: время истекло, награда не получена`);
        }
      }
    );
  });
}
const abortBtn = div.querySelector("[data-abort]");
if(abortBtn) {
abortBtn.addEventListener("click", ()=> {
if(q.type === "рейд") {
showConfirm(
    '❌ Отмена рейда',
    `Отменить рейд «${q.title}» досрочно?\n\n⚠️ Дебафф «Слабость»: −50% XP героя на 25% длительности рейда.`,
    () => abortQuest(idx, true)
    );
} else {
    showConfirm(
        '❌ Отмена квеста',
        `Отменить квест «${q.title}»?\n\n⚠️ Будет наложен дебафф «Слабость» на XP героя.`,
        () => abortQuest(idx, false)
        );
}
});
}
active.appendChild(div);
});
}
}
// Stats
const statCompleted = document.getElementById("statCompleted");
const statFailed = document.getElementById("statFailed");
const statAborted = document.getElementById("statAborted");
if (statCompleted) statCompleted.textContent = state.quests.stats.completed;
if (statFailed) statFailed.textContent = state.quests.stats.failed;
if (statAborted) statAborted.textContent = state.quests.stats.aborted;
// Completed
if (done) {
done.innerHTML = "";
if(state.quests.completed.length === 0) {
done.innerHTML = `<div class="empty">Нет завершённых квестов</div>`;
} else {
const last10 = [...state.quests.completed].reverse().slice(0,10);
last10.forEach(q=>{
const div = document.createElement("div");
div.className = "sub";
div.style.padding = "3px 0";
div.textContent = `#${formatQuestId(q.id)} ${q.icon} ${q.title}`;
done.appendChild(div);
});
if(state.quests.completed.length > 10) {
const div = document.createElement("div");
div.className = "sub muted";
div.style.padding = "3px 0";
div.textContent = `... и ещё ${state.quests.completed.length - 10} квестов`;
done.appendChild(div);
}
}
}
startRaidTimer();
}

function skillBarProgress(xp){
const level = getSkillLevel(xp);
const current = skillLevelFloor(level);
const next = skillLevelThreshold(level + 1);
const need = Math.max(1, next - current);
return Math.min(100, Math.max(0, ((xp - current) / need) * 100));
}

function showVictoryBanner(title, reward, items, heading, skillChanges = [], rewardMeta = null){
document.querySelectorAll(".victory-banner").forEach(el=> el.remove());
const el = document.createElement("div");
el.className = "victory-banner";
const baseReward = rewardMeta?.baseReward || reward || {};
const finalReward = reward || {};
const penalty = Math.max(0, Math.min(95, Number(rewardMeta?.heroXPPenaltyPercent) || 0));
const hasHeroXPDebuff = penalty > 0 && Number(baseReward.heroXP) > 0;
const debuffs = Array.isArray(rewardMeta?.activeRewardDebuffs) ? rewardMeta.activeRewardDebuffs : [];
const debuffLines = debuffs.map(d => {
  const pct = Math.round((1 - Number(d.heroMultiplier ?? 1)) * 100);
  return pct > 0 ? `${escapeHtml(d.name || 'Слабость')} −${pct}%` : '';
}).filter(Boolean);
const heroEffectBreakdown = typeof getActiveEffectRewardBreakdown === 'function'
  ? getActiveEffectRewardBreakdown('heroXP')
  : [];
const heroEffectMultiplier = heroEffectBreakdown.reduce((m, effect) => m * Number(effect.multiplier || 1), 1);
const coins = Number(finalReward.coins) || 0;
const itemsHtml = (items && items.length)
? `<div class="vb-section vb-items-section" data-reward-section="items">
    <div class="vb-section-title">🎁 ПРЕДМЕТЫ</div>
    <div class="pill-row vb-rewards">${items.map(it=>`<span class="pill reward-skill">🎁 ${escapeHtml(it.name || '')}</span>`).join('')}</div>
  </div>`
: '';
const coinsHtml = coins ? `
<div class="vb-section vb-coins-section" data-reward-section="coins">
  <div class="vb-section-title">🪙 МОНЕТЫ</div>
  <div class="vb-reward-number reward-coins-number" data-coins-value>+0</div>
  <div class="vb-reward-sub">монет получено</div>
</div>` : '';
const skillsHtml = skillChanges.length ? `
<div class="vb-section vb-skills" data-reward-section="skills">
  <div class="vb-section-title">🌳 НАВЫКИ — начисление XP</div>
  ${skillChanges.map((sc, i) => {
    const beforePct = skillBarProgress(sc.beforeXP);
    const afterPct = skillBarProgress(sc.afterXP);
    const remainingPct = Math.max(0, 100 - afterPct);
    const levelChanged = sc.afterLevel > sc.beforeLevel;
    return `<div class="vb-skill" data-skill-index="${i}">
      <div class="vb-skill-head">
        <span class="vb-skill-name">${escapeHtml(sc.skill)}</span>
        <span class="vb-skill-xp">+${sc.appliedXP} XP</span>
      </div>
      <div class="vb-skill-levels">
        <span>ур. ${sc.beforeLevel}</span>
        ${levelChanged ? `<b>→ ур. ${sc.afterLevel}</b>` : `<span>ур. ${sc.afterLevel}</span>`}
      </div>
      <div class="vb-skill-bar"><span style="width:${beforePct}%"></span></div>
      <div class="vb-skill-label">${sc.beforeXP} → ${sc.afterXP} XP</div>
      <div class="vb-skill-target">${levelChanged ? `⬆️ Ур. ${sc.afterLevel} · до следующего уровня ${remainingPct.toFixed(0)}%` : `До следующего уровня: ${remainingPct.toFixed(0)}%`}</div>
    </div>`;
  }).join('')}
</div>` : '';
el.innerHTML = `<div class="vb-card">

<div class="vb-title">${escapeHtml(heading || "🏆 КВЕСТ ЗАВЕРШЁН")}</div>
<div class="vb-quest">${escapeHtml(title)}</div>
<div class="vb-section vb-hero-section" data-reward-section="hero">
  <div class="vb-section-title">⭐ ОПЫТ ГЕРОЯ</div>
  <div class="vb-xp-calc" data-xp-calc>
    <div class="vb-xp-base-label">ЗА КВЕСТ</div>
    <div class="vb-xp-main" data-xp-base>+${Number(baseReward.heroXP) || 0} XP</div>
    <div class="vb-xp-result" data-xp-final>Получено: +0 XP</div>
    <div class="vb-xp-effects-inline" data-xp-modifiers>${(() => {
      const parts = [];
      heroEffectBreakdown.forEach(effect => {
        const pct = Math.round(effect.percent);
        const sign = pct >= 0 ? '+' : '−';
        const duration = effect.durationType === 'permanent' ? 'постоянный' : 'активный';
        parts.push(`${escapeHtml(effect.icon)} ${escapeHtml(effect.name)} ${sign}${Math.abs(pct)}% · ${duration}`);
      });
      if (hasHeroXPDebuff) parts.push(`⚠️ ${escapeHtml(debuffLines.join(' + ') || 'Слабость')} −${penalty}% · активный`);
      return parts.length ? parts.join(' · ') : 'Без модификаторов';
    })()}</div>
  </div>
</div>
${coinsHtml}
${skillsHtml}
${itemsHtml}
<div class="vb-skip-hint">Нажми, чтобы пропустить анимацию</div>

</div>`;
document.body.appendChild(el);

let finished = false;
let animationDone = false;
let animationDoneTimer = null;
const markAnimationDone = () => {
  if (finished || animationDone) return;
  animationDone = true;
  const hint = el.querySelector('.vb-skip-hint');
  if (hint) hint.textContent = 'Нажми, чтобы закрыть';
};
const skipAnimation = () => {
  if (finished) return;
  finished = true;
  animationDone = true;
  if (animationDoneTimer) { clearTimeout(animationDoneTimer); animationDoneTimer = null; }
  el.classList.add('skip-animation');
  const heroSection = el.querySelector('[data-reward-section="hero"]');
  if (heroSection) heroSection.classList.add('active');
  const xpBase = el.querySelector('[data-xp-base]');
  const xpFinal = el.querySelector('[data-xp-final]');
  if (xpBase) xpBase.textContent = `+${Number(baseReward.heroXP) || 0} XP`;
  if (xpFinal) xpFinal.textContent = `Получено: +${Number(finalReward.heroXP) || 0} XP`;
  const coinsValue = el.querySelector('[data-coins-value]');
  if (coinsValue) coinsValue.textContent = `+${coins}`;
  el.querySelectorAll('[data-reward-section]').forEach(section => section.classList.add('active'));
  el.querySelectorAll('.vb-skill').forEach((row, i) => {
    const sc = skillChanges[i];
    const bar = row.querySelector('.vb-skill-bar span');
    if (bar && sc) bar.style.width = skillBarProgress(sc.afterXP) + '%';
  });
};

const closeBanner = () => {
  if (!el.isConnected) return;
  el.classList.remove("show");
  setTimeout(() => {
    if (el.isConnected) el.remove();
    const levelData = pendingLevelUpData;
    pendingLevelUpData = null;
    if (levelData) showLevelUpOverlay(levelData);
    else if (typeof releaseRewardSequence === 'function') releaseRewardSequence();
  }, 600);
};

el.addEventListener('click', () => {
  if (!animationDone) skipAnimation();
  else closeBanner();
});

requestAnimationFrame(()=> requestAnimationFrame(()=> {
  el.classList.add("show");
  const heroSection = el.querySelector('[data-reward-section="hero"]');
  if (heroSection) heroSection.classList.add('active');
  const xpBase = el.querySelector('[data-xp-base]');
  const xpFinal = el.querySelector('[data-xp-final]');
  const baseXP = Number(baseReward.heroXP) || 0;
  const finalXP = Number(finalReward.heroXP) || 0;
  const heroDuration = hasHeroXPDebuff ? 1800 : 1250;
  const skillStartDelay = hasHeroXPDebuff ? 2050 : 1450;
  const skillDuration = 850;
  const skillGap = 260;

  // Главный XP теперь всегда проходит путь от 0 до фактически полученной
  // награды. При дебаффе сначала показывается базовая награда, затем её
  // уменьшение; без дебаффа идёт прямая анимация 0 → итог.
  const heroStart = performance.now();
  const animateHeroXP = now => {
    if (finished) return;
    const t = Math.min(1, (now - heroStart) / heroDuration);
    const eased = 1 - Math.pow(1 - t, 3);
    let current = 0;
    if (hasHeroXPDebuff && t < 0.34) {
      const p = t / 0.34;
      current = Math.round(baseXP * (1 - Math.pow(1 - p, 3)));
      if (xpFinal) xpFinal.textContent = `Получено: +${current} XP`;
    } else {
      const p = hasHeroXPDebuff ? Math.min(1, (t - 0.34) / 0.66) : eased;
      const applied = 1 - Math.pow(1 - p, 3);
      current = hasHeroXPDebuff
        ? Math.round(baseXP * heroEffectMultiplier - (baseXP * heroEffectMultiplier - finalXP) * applied)
        : Math.round(finalXP * applied);
      if (xpFinal) xpFinal.textContent = `Получено: +${current} XP`;
    }
    if (t < 1) requestAnimationFrame(animateHeroXP);
  };
  requestAnimationFrame(animateHeroXP);

  const animateCoins = () => {
    const section = el.querySelector('[data-reward-section="coins"]');
    const value = el.querySelector('[data-coins-value]');
    if (!section || !value) return;
    section.classList.add('active');
    const start = performance.now();
    const duration = 700;
    const frame = now => {
      if (finished) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      value.textContent = `+${Math.round(coins * eased)}`;
      if (t < 1) requestAnimationFrame(frame);
      else value.textContent = `+${coins}`;
    };
    requestAnimationFrame(frame);
  };

  // Каждый навык получает свою отдельную визуальную фазу: числовой XP и
  // полоса прогресса двигаются синхронно, а при повышении уровня полоса
  // доходит до 100%, сбрасывается и показывает остаток нового уровня.
  const animateSkill = (sc, index) => {
    const row = el.querySelector(`.vb-skill[data-skill-index="${index}"]`);
    if (!row || finished) return;
    const section = el.querySelector('[data-reward-section="skills"]');
    if (section) section.classList.add('active');
    const bar = row.querySelector('.vb-skill-bar span');
    const label = row.querySelector('.vb-skill-label');
    const target = row.querySelector('.vb-skill-target');
    const levels = row.querySelector('.vb-skill-levels');
    if (!bar) return;

    const beforeXP = Number(sc.beforeXP) || 0;
    const afterXP = Number(sc.afterXP) || beforeXP;
    const beforePct = skillBarProgress(beforeXP);
    const afterPct = skillBarProgress(afterXP);
    const remainingPct = Math.max(0, 100 - afterPct);
    const levelChanged = sc.afterLevel > sc.beforeLevel;
    const start = performance.now();

    const frame = now => {
      if (finished) return;
      const t = Math.min(1, (now - start) / skillDuration);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentXP = Math.round(beforeXP + (afterXP - beforeXP) * eased);
      const currentPct = skillBarProgress(currentXP);
      bar.style.width = currentPct + '%';
      if (label) label.textContent = `${beforeXP} → ${afterXP} XP`;
      if (target) target.textContent = levelChanged && t >= .92
        ? `⬆️ Ур. ${sc.afterLevel} · до следующего уровня ${remainingPct.toFixed(0)}%`
        : (levelChanged ? `${Math.max(0, 100-currentPct).toFixed(0)}% до нового уровня` : `До следующего уровня: ${Math.max(0, 100-currentPct).toFixed(0)}%`);
      if (levels && levelChanged && t >= .92) levels.innerHTML = `<span>ур. ${sc.beforeLevel}</span><b>→ ур. ${sc.afterLevel}</b>`;

      if (t < 1) {
        requestAnimationFrame(frame);
        return;
      }

      if (levelChanged) {
        bar.style.width = '100%';
        setTimeout(() => {
          if (finished) return;
          bar.classList.add('level-reset');
          bar.style.width = afterPct + '%';
          setTimeout(() => bar.classList.remove('level-reset'), 180);
        }, 180);
      } else {
        bar.style.width = afterPct + '%';
      }
    };
    requestAnimationFrame(frame);
  };

  if (coins) setTimeout(animateCoins, hasHeroXPDebuff ? 1950 : 1250);
  skillChanges.forEach((sc, index) => {
    setTimeout(() => animateSkill(sc, index), skillStartDelay + index * skillGap);
  });
  if (items && items.length) {
    const itemsSection = el.querySelector('[data-reward-section="items"]');
    const itemsDelay = skillChanges.length
      ? skillStartDelay + (skillChanges.length - 1) * skillGap + skillDuration + 450
      : (coins ? (hasHeroXPDebuff ? 2750 : 2050) : (hasHeroXPDebuff ? 2050 : 1450));
    setTimeout(() => { if (!finished && itemsSection) itemsSection.classList.add('active'); }, itemsDelay);
  }

  const totalAnimationTime = Math.max(
    heroDuration,
    skillChanges.length ? skillStartDelay + (skillChanges.length - 1) * skillGap + skillDuration + 420 : 0
  );
  animationDoneTimer = setTimeout(markAnimationDone, totalAnimationTime);
}));
}

function showLevelUpOverlay(data){
  if (!data) return;
  if (typeof Sound !== 'undefined') Sound.levelup();
  document.querySelectorAll('.level-up-overlay').forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  const fromLevel = Number(data.fromLevel) || 0;
  const toLevel = Number(data.toLevel) || fromLevel;
  const fromPower = Number(data.fromPower) || 0;
  const toPower = Number(data.toPower) || fromPower;
  const levelsGained = Math.max(1, toLevel - fromLevel);
  const duration = 2000;
  overlay.innerHTML = `
    <div class="level-up-card">
      <div class="lu-glow"></div>
      <div class="lu-kicker">✦ ПРОГРЕСС ПЕРСОНАЖА ✦</div>
      <div class="lu-title">НОВЫЙ УРОВЕНЬ</div>
      <div class="lu-level" id="luLevelValue">${fromLevel}</div>
      <div class="lu-level-arrow">▲</div>
      <div class="lu-power-label">МОЩЬ</div>
      <div class="lu-power" id="luPowerValue">${fmt(fromPower)}</div>
      <div class="lu-power-delta" id="luPowerDelta">+0</div>
      <div class="lu-points">
        <span class="lu-point-pill">⭐ Очки SPECIAL +${levelsGained}</span>
        <span class="lu-point-pill">✨ Очки перков +${levelsGained}</span>
      </div>
      <div class="lu-skip-hint">Нажми на экран, чтобы пропустить</div>
    </div>`;
  document.body.appendChild(overlay);

  let done = false;
  let completed = false;
  let raf = null;
  const finish = () => {
    if (done || completed) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    const levelEl = overlay.querySelector('#luLevelValue');
    const powerEl = overlay.querySelector('#luPowerValue');
    const deltaEl = overlay.querySelector('#luPowerDelta');
    if (levelEl) levelEl.textContent = toLevel;
    if (powerEl) powerEl.textContent = fmt(toPower);
    if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, toPower - fromPower))}`;
    overlay.classList.add('level-up-skip');
    setTimeout(close, 420);
  };
  const close = () => {
    if (!overlay.isConnected) return;
    overlay.classList.add('hide');
    setTimeout(() => { overlay.remove(); if (typeof releaseRewardSequence === 'function') releaseRewardSequence(); }, 450);
  };
  overlay.addEventListener('click', () => {
    if (completed) close();
    else finish();
  });

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 4);
    const step = now => {
      if (done) return;
      const p = Math.min(1, (now - start) / duration);
      const e = ease(p);
      const levelValue = Math.round(fromLevel + (toLevel - fromLevel) * e);
      const powerValue = Math.round(fromPower + (toPower - fromPower) * e);
      const levelEl = overlay.querySelector('#luLevelValue');
      const powerEl = overlay.querySelector('#luPowerValue');
      const deltaEl = overlay.querySelector('#luPowerDelta');
      if (levelEl) levelEl.textContent = levelValue;
      if (powerEl) powerEl.textContent = fmt(powerValue);
      if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, powerValue - fromPower))}`;
      if (p < 1) raf = requestAnimationFrame(step);
      else {
        done = true;
        completed = true;
        if (levelEl) levelEl.textContent = toLevel;
        if (powerEl) powerEl.textContent = fmt(toPower);
        if (deltaEl) deltaEl.textContent = `+${fmt(Math.max(0, toPower - fromPower))}`;
        overlay.classList.add('level-up-complete');
      }
    };
    raf = requestAnimationFrame(step);
  });
}

function spawnBoostEffect(blockEl){
if (!blockEl) return;
const valueEl = blockEl.querySelector('.sp-value');
const letterEl = blockEl.querySelector('.sp-letter');
blockEl.classList.remove('special-awakening');
if (valueEl) valueEl.classList.remove('special-awakening');
if (letterEl) letterEl.classList.remove('special-awakening');
void blockEl.offsetWidth;
blockEl.classList.add('special-awakening');
}

function showPhaseBanner(bossName, phaseName, reward){
document.querySelectorAll(".victory-banner").forEach(el=> el.remove());
const el = document.createElement("div");
el.className = "victory-banner phase-banner";
el.innerHTML = `
<div class="vb-title">⚔️ ФАЗА ПОБЕЖДЕНА</div>
<div class="vb-quest">${escapeHtml(bossName)} — ${escapeHtml(phaseName)}</div>
${rewardPills(reward).replace('pill-row','pill-row vb-rewards')}
`;
document.body.appendChild(el);
requestAnimationFrame(()=> requestAnimationFrame(()=> el.classList.add("show")));
setTimeout(()=>{
el.classList.remove("show");
setTimeout(()=> el.remove(), 600);
}, 3000);
}

function completeQuest(idx, withBonus){
const q = state.quests.active[idx];
if (q && q.type === "рейд" && typeof QuestCore !== "undefined" && QuestCore.isRaidTimeExpired && !QuestCore.isRaidTimeExpired(q)) {
  toast("⏳ Рейд ещё идёт — завершить можно только после таймера");
  return;
}
if (typeof beginRewardSequence === 'function') beginRewardSequence();
const result = QuestCore.completeQuest(idx, withBonus);
if (!result) return;
if (result.blocked) {
  if (result.reason === "raid-in-progress") toast("⏳ Рейд ещё идёт — завершить можно только после таймера");
  else toast("Активен рейд — сначала заверши его");
  return;
}
if (result.failed) {
  if (typeof releaseRewardSequence === 'function') releaseRewardSequence();
  if (typeof Sound !== 'undefined') Sound.fail();
  toast(`⏰ Рейд «${result.q.title}» провален: время истекло, награда не получена`);
  persist(); renderAll();
  return;
}
if (typeof Sound !== 'undefined') {
  if (result.q && result.q.type === 'рейд') Sound.success();
  else Sound.quest();
}
try {
  const header = document.querySelector('.header');
  if (header) {
    header.classList.remove('reward-flash');
    void header.offsetWidth;
    header.classList.add('reward-flash');
    setTimeout(() => header.classList.remove('reward-flash'), 700);
  }
} catch (_) {}
(result.events || []).forEach(ev => logEvent(ev.type, ev.icon, ev.text, ev.meta));
if (typeof syncAchievements === 'function') syncAchievements();
if (result.q.type === "рейд") {
  if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
  state._raidExpiredNotified = false;
  if (typeof clearRaidNotification === 'function') clearRaidNotification();
  const timerEl = document.getElementById('raidTimer');
  if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
}
persist(); renderAll();
showVictoryBanner(result.q.title, result.combined, result.droppedItems, undefined, result.skillChanges || [], result);
}

async function abortQuest(idx, isRaid) {
const result = QuestCore.abortQuest(idx, isRaid);
if (result && typeof Sound !== 'undefined') Sound.fail();
if (!result) return;
if (result.isRaid) {
  toast(`❌ Рейд отменён. «Слабость»: −50% XP героя на ${formatDebuffDuration(result.debuff?.expiresAt)}`);
} else if (result.debuff?.name === 'Изнеможение') {
  toast('❌ Квест отменён. «Изнеможение»: −75% XP героя, монет и XP навыков');
} else {
  const pct = Math.round((1 - Number(result.debuff?.heroMultiplier || 1)) * 100);
  toast(`❌ Квест отменён. «Слабость»: −${pct}% XP героя`);
}
if (result.q.type === "рейд") {
  if (raidTimerInterval) { clearInterval(raidTimerInterval); raidTimerInterval = null; }
  state._raidExpiredNotified = false;
  if (typeof clearRaidNotification === 'function') clearRaidNotification();
  const timerEl = document.getElementById('raidTimer');
  if (timerEl) { timerEl.textContent = ''; timerEl.classList.remove('raid-timer-expired'); }
}
persist(); renderAll();
}

function renderSkillPicker(){
const wrap = document.getElementById("qNewSkillsPick");
if (!wrap) return;
wrap.innerHTML = "";
Object.keys(state.skills).forEach(name=>{
const label = document.createElement("label");
label.className = "skill-pick-label";
label.innerHTML = `<input type="checkbox" value="${name}"/> ${name}`;
wrap.appendChild(label);
});
wrap.querySelectorAll("input[type=checkbox]").forEach(cb=> cb.addEventListener("change", () => {
cb.closest(".skill-pick-label").classList.toggle("picked", cb.checked);
updatePreview();
}));
}

function selectedSkills(){
return Array.from(document.querySelectorAll("#qNewSkillsPick input:checked")).map(cb=>cb.value);
}

function updatePreview(){
const difficulty = document.getElementById("qNewDifficulty");
const minutes = document.getElementById("qNewMinutes");
const desc = document.getElementById("qNewDesc");
const preview = document.getElementById("qNewPreview");
if (!difficulty || !minutes || !desc || !preview) return;
const diff = difficulty.value;
const min = Number(minutes.value) || 0;
const dsc = desc.value;
const skills = selectedSkills();
const r = computeQuestReward(diff, min, skills, dsc);
const skillsStr = Object.entries(r.skills).map(([k,v])=>`+${v} ${k}`).join(" · ");
const descNote = r.descBonus > 0
? ` <span class="muted">(вкл. +${r.descBonus} XP за подробное описание${r.descBonus>=DESC_XP_CAP ? ", максимум" : ""})</span>`
: ` <span class="muted">(опиши задачу подробнее — до +${DESC_XP_CAP} XP)</span>`;
const itemsNote = pendingQuestItems.length
? ` · ${pendingQuestItems.map(it=>`🎁 ${it.name}`).join(', ')}`
: '';
preview.innerHTML =
`+${r.heroXP} XP героя · +${r.coins}🪙` + (skillsStr ? " · " + skillsStr : "") + descNote + itemsNote;
}

function wireNewQuestForm(){
renderSkillPicker();
const resetBtn = document.getElementById("qNewResetBtn");
if (resetBtn) resetBtn.addEventListener("click", () => {
clearNewQuestForm();
toast("Параметры квеста сброшены");
});
["qNewDifficulty","qNewMinutes"].forEach(id=>{
const el = document.getElementById(id);
if (el) {
el.addEventListener("input", updatePreview);
el.addEventListener("change", updatePreview);
}
});
const descEl = document.getElementById("qNewDesc");
if (descEl) descEl.addEventListener("input", updatePreview);
const typeEl = document.getElementById("qNewType");
if (typeEl) {
typeEl.addEventListener("change", (e)=>{
if(e.target.value === "рейд") {
const diff = document.getElementById("qNewDifficulty");
if (diff) diff.value = "epic";
}
if (typeof syncQuestTypeUI === "function") syncQuestTypeUI();
updatePreview();
});
}
updatePreview();

async function build(){
const title = document.getElementById("qNewTitle");
const desc = document.getElementById("qNewDesc");
const type = document.getElementById("qNewType");
const difficulty = document.getElementById("qNewDifficulty");
const minutes = document.getElementById("qNewMinutes");
if (!title || !desc || !type || !difficulty || !minutes) return null;
const titleVal = title.value.trim();
if(!titleVal){ toast("Укажи название квеста"); return null; }
const descVal = desc.value.trim();
const typeVal = type.value;
const difficultyVal = difficulty.value;
let minutesVal = Number(minutes.value) || 0;
if (typeVal === 'рейд') {
  minutesVal = Math.min(RAID_MAX_MINUTES, Math.max(1, minutesVal));
}
const skills = selectedSkills();
let reward = computeQuestReward(difficultyVal, minutesVal, skills, descVal);
if (pendingQuestItems.length) reward.items = pendingQuestItems.map(it => ({...it}));
const q = {
icon: typeVal==="рейд" ? "👹" : "📜", title: `«${titleVal}»`,
desc: descVal, type: typeVal, difficulty: difficultyVal, estMinutes: minutesVal || undefined,
reward
};
return q;
}

function syncQuestTypeUI() {
  const typeEl = document.getElementById("qNewType");
  const addPlanned = document.getElementById("qNewAddPlanned");
  const addActive = document.getElementById("qNewAddActive");
  const hint = document.getElementById("qNewTypeHint");
  const isRaid = typeEl && typeEl.value === "рейд";
  if (addPlanned) addPlanned.style.display = isRaid ? "" : "none";
  if (addActive) addActive.style.display = isRaid ? "none" : "";
  if (hint) {
    hint.textContent = isRaid
      ? "Рейд сначала попадает в запланированные. Старт — только оттуда, с подтверждением."
      : "Обычный квест сразу становится активным.";
  }
}

const addPlanned = document.getElementById("qNewAddPlanned");
if (addPlanned) {
addPlanned.addEventListener("click", async ()=>{
const q = await build(); if(!q) return;
if (q.type !== "рейд") { toast("В запланированные можно добавить только рейд"); return; }
const createdQuest = QuestCore.createQuest(q);
if (!createdQuest.ok) {
  toast(createdQuest.reason === "planned_raids_only" ? "В запланированные — только рейды" : "Не удалось создать рейд");
  return;
}
clearNewQuestForm();
persist(); renderAll();
toast("⚔️ Рейд добавлен в запланированные");
});
}
const addActive = document.getElementById("qNewAddActive");
if (addActive) {
addActive.addEventListener("click", async ()=>{
const q = await build(); if(!q) return;
if (q.type === "рейд") { toast("Рейд можно только запланировать, затем начать"); return; }
const startedQuest = QuestCore.startNewQuest(q);
if (!startedQuest.ok) {
  if (startedQuest.reason === 'raid_must_be_planned') toast('⚠️ Рейд сначала в запланированные');
  else toast('Не удалось добавить квест');
  return;
}
clearNewQuestForm();
persist(); renderAll();
toast("Квест добавлен в активные");
});
}
syncQuestTypeUI();
}

function clearNewQuestForm(){
const title = document.getElementById("qNewTitle");
const desc = document.getElementById("qNewDesc");
const minutes = document.getElementById("qNewMinutes");
const difficulty = document.getElementById("qNewDifficulty");
const type = document.getElementById("qNewType");
if (title) title.value = "";
if (desc) desc.value = "";
if (minutes) minutes.value = "30";
if (difficulty) difficulty.value = "normal";
if (type) type.value = "обычный";
document.querySelectorAll("#qNewSkillsPick input[type=checkbox]").forEach(cb=> { cb.checked=false; cb.closest(".skill-pick-label").classList.remove("picked"); });
pendingQuestItems = [];
updatePreview();
if (typeof syncQuestTypeUI === "function") syncQuestTypeUI();
}

function showBossVictoryBanner(bossName, reward, items){
if (typeof Sound !== 'undefined') Sound.boss();
showVictoryBanner(bossName, reward, items, "👑 БОСС ПОВЕРЖЕН");
}

/* ===== js\boss-core.js ===== */
"use strict";


// Pure game logic for bosses. No DOM, rendering, animation or persistence.
const BossCore = (() => {
  function getActiveBoss() {
    return S().bosses.find(b => b.id === S().activeBossId) || null;
  }

  function currentPhase(boss) {
    return boss && Array.isArray(boss.phases) ? boss.phases.find(p => !p.defeated) || null : null;
  }

  function totalProgress(boss) {
    return (boss?.phases || []).reduce((sum, p) => sum + Math.min(Number(p.progress) || 0, Number(p.target) || 0), 0);
  }

  function hpPercent(boss) {
    if (!boss || !boss.target) return 0;
    return Math.min(100, Math.max(0, (boss.target - totalProgress(boss)) / boss.target * 100));
  }

  function phasePercent(phase) {
    if (!phase || !phase.target) return 0;
    return Math.min(100, Math.max(0, phase.progress / phase.target * 100));
  }

  function create(boss) {
    if (!boss || typeof boss !== 'object') return null;
    if (!Array.isArray(S().bosses)) S().bosses = [];
    S().bosses.push(boss);
    S().activeBossId = boss.id;
    return boss;
  }

  function setActive(index) {
    const boss = S().bosses[index];
    if (!boss) return null;
    S().activeBossId = boss.id;
    return boss;
  }

  function remove(index) {
    if (index < 0 || index >= S().bosses.length) return null;
    const boss = S().bosses[index];
    S().bosses.splice(index, 1);
    if (S().activeBossId === boss.id) {
      S().activeBossId = S().bosses.length ? S().bosses[0].id : null;
    }
    return boss;
  }

  function heal(boss, amount) {
    if (!boss || boss.bossType === 'other') return { ok:false, message:'Этот тип босса нельзя отхилить' };
    const phase = currentPhase(boss);
    if (!phase) return { ok:false, message:'У босса нет активной фазы' };
    const available = Math.min(Math.max(0, Number(phase.progress) || 0), Math.max(0, Number(S().cushion) || 0));
    if (available <= 0) return { ok:false, message:'В текущей фазе нет накопленного прогресса для отхила' };
    const healAmount = Math.min(Math.floor(Number(amount) || 0), available);
    if (healAmount <= 0) return { ok:false, message:'Укажи корректную сумму' };
    phase.progress -= healAmount;
    S().cushion -= healAmount;
    return { ok:true, amount:healAmount, phase, hpPercent:hpPercent(boss), phasePercent:phasePercent(phase) };
  }

  function damage(boss, amount) {
    const numeric = Math.floor(Number(amount) || 0);
    if (!boss) return { ok:false, message:'Босс не найден' };
    if (numeric <= 0) return { ok:false, message:'Укажи корректную сумму' };
    const before = currentPhase(boss);
    if (!before) return { ok:false, message:'У босса нет активной фазы' };

    const beforeHpPct = hpPercent(boss);
    const beforePhasePct = phasePercent(before);
    let remaining = numeric;
    if (boss.bossType !== 'other') S().cushion = (Number(S().cushion) || 0) + numeric;
    const defeatedThisHit = [];

    while (remaining > 0) {
      const phase = currentPhase(boss);
      if (!phase) break;
      const need = Math.max(0, phase.target - phase.progress);
      const take = Math.min(need, remaining);
      phase.progress += take;
      remaining -= take;
      if (phase.progress >= phase.target && !phase.defeated && !phase.applied) {
        phase.defeated = true;
        if (typeof applyReward === 'function') applyReward(phase.reward, phase.name + ' побеждена');
        phase.applied = true;
        defeatedThisHit.push(phase);
      }
    }

    const defeated = boss.phases.every(p => p.defeated);
    if (defeated && !boss.victoryRewarded) boss.victoryPending = true;
    const afterPhase = currentPhase(boss);
    return {
      ok:true,
      requested:numeric,
      appliedDamage:numeric - remaining,
      defeated,
      defeatedThisHit,
      beforeHpPct,
      beforePhasePct,
      afterHpPct:hpPercent(boss),
      afterPhasePct:phasePercent(afterPhase),
      events: defeatedThisHit.map(phase => ({ type:'boss', icon:'👹', text:`${boss.name}: ${phase.name} побеждена` }))
    };
  }

  return { getActiveBoss, currentPhase, totalProgress, hpPercent, phasePercent, create, setActive, remove, heal, damage };
})();

/* ===== js\bosses.js ===== */
"use strict";

function getActiveBoss() { return BossCore.getActiveBoss(); }
function currentBossPhase(boss) { return BossCore.currentPhase(boss); }


let bossRemovalTimerHandle = null;

function formatBossRemovalCountdown(ms){
const total = Math.max(0, Math.ceil(ms / 1000));
const minutes = Math.floor(total / 60);
const seconds = total % 60;
return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startBossRemovalTimers(){
if (bossRemovalTimerHandle) return;
const tick = () => {
const now = Date.now();
let changed = false;
for (let i = state.bosses.length - 1; i >= 0; i--){
const boss = state.bosses[i];
if (!boss.removeAt) continue;
const remaining = boss.removeAt - now;
const timerEl = document.getElementById(`bossRemoval_${boss.id}`);
if (remaining <= 0){
const removed = BossCore.remove(i);
if (!removed) continue;
changed = true;
continue;
}
if (timerEl) timerEl.textContent = `Удаление босса через ${formatBossRemovalCountdown(remaining)}`;
}
if (changed){
persist();
renderAll();
}
if (!state.bosses.some(b => b.removeAt)){
clearInterval(bossRemovalTimerHandle);
bossRemovalTimerHandle = null;
}
};
if (state.bosses.some(b => b.removeAt)){
tick();
bossRemovalTimerHandle = setInterval(tick, 250);
}
}

function armBossRemovalTimer(boss){
boss.removeAt = Date.now() + 60000;
persist();
renderBosses();
startBossRemovalTimers();
}

function renderBosses(){
const list = document.getElementById("bossList");
if (!list) return;
list.innerHTML = "";
if(state.bosses.length === 0) {
list.innerHTML = `<div class="empty">Нет боссов. Добавьте первого!</div>`;
return;
}
state.bosses.forEach((boss, idx) => {
const isActive = boss.id === state.activeBossId;
const isFinancial = boss.bossType !== 'other';
const unit = boss.unit || (isFinancial ? '₽' : 'ед.');
const totalProgress = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const pct = (totalProgress / boss.target * 100);
const remaining = Math.max(0, boss.target - totalProgress);
// Финансовый босс — это "здоровье", которое тает от урона (внесённых денег):
// полоска стартует полной и опустышается к 0, а не заполняется с нуля.
const barPct = isFinancial ? (remaining / boss.target * 100) : pct;
const barGradient = isFinancial ? 'linear-gradient(90deg,var(--red),#ff8a3d)' : 'linear-gradient(90deg,#ff8a3d,var(--gold))';
const createdLabel = boss.createdAt ? new Date(boss.createdAt).toLocaleDateString('ru-RU') : '—';
const cache = bossBarCache[boss.id] || null;
const initialHpPct = cache ? cache.hp : Math.min(100, barPct);
const initialPhasePcts = boss.phases.map((p, i) => {
const target = Math.min(100, p.progress/p.target*100);
return cache && cache.phases && cache.phases[i] !== undefined ? cache.phases[i] : target;
});
const isDefeated = !!(boss.victoryPending || boss.victoryRewarded || boss.removeAt);
const div = document.createElement("div");
div.className = "card";
div.dataset.bossCard = boss.id;
div.style.borderColor = isActive && !isDefeated ? "var(--phosphor)" : "var(--line)";
div.innerHTML = `
<h3>${escapeHtml(boss.name)} ${isActive && !isDefeated ? '🟢' : ''}</h3>
<div class="sub">${escapeHtml(boss.goal)}</div>
<div class="sub">📅 Создан: ${createdLabel}</div>
${isDefeated ? `
<div class="boss-phases-collapsed">
<span>⚔️ Все 3 фазы завершены</span>
<span>${boss.removeAt ? `<strong id="bossRemoval_${boss.id}">Удаление босса через ${formatBossRemovalCountdown(boss.removeAt - Date.now())}</strong>` : (boss.victoryPending ? '⚠️ Награда AI ещё не выдана' : '🤖 Ожидание награды AI')}</span>
</div>` : `
<div class="xp-row" style="margin-top:8px;">
<div class="bar boss-bar"><span id="bossHpFill_${boss.id}" style="width:${initialHpPct}%; background:${barGradient};"></span></div>
<span>${isFinancial ? '❤️ ' + barPct.toFixed(1) + '%' : pct.toFixed(1) + '%'}</span>
</div>
<div style="font-size:11px; color:var(--phosphor-dim); margin:4px 0;">
${isFinancial
? `HP босса: ${fmt(remaining)} / ${fmt(boss.target)} ${unit}`
: `${fmt(totalProgress)} / ${fmt(boss.target)} ${unit}`}
</div>
<div id="bossPhases_${boss.id}" style="margin-top:8px;"></div>`}
${!isActive && !isDefeated ? `<div class="actions"><button class="btn primary" data-setactive="${idx}">Сделать активным</button></div>` : ''}
${boss.victoryPending && !boss.removeAt ? `<div class="actions"><button class="btn primary bossRetryRewardBtn" data-bossid="${boss.id}">🤖 Повторить выдачу награды</button></div>` : ''}
${!isDefeated ? `<div class="actions"><button class="btn danger" data-delboss="${idx}">Удалить босса</button></div>` : ''}
`;
const phasesContainer = div.querySelector(`#bossPhases_${boss.id}`);
if (phasesContainer) boss.phases.forEach((p, i) => {
const phaseDiv = document.createElement("div");
phaseDiv.className = "boss-phase" + (p.defeated ? " defeated":"");
const localPct = Math.min(100, p.progress/p.target*100);
phaseDiv.innerHTML = `
<div class="ph-h"><span>${p.defeated ? "🟢":"🔴"} ${escapeHtml(p.name)} — ${fmt(p.target)} ${escapeHtml(unit)}</span><span>${p.defeated ? "побеждена" : fmt(p.progress)+" / "+fmt(p.target)}</span></div>
<div class="bar boss-bar" style="margin-top:4px;"><span id="bossPhaseFill_${boss.id}_${i}" style="width:${initialPhasePcts[i]}%"></span></div>
`;
phasesContainer.appendChild(phaseDiv);
});
// Запоминаем целевые (истинные) значения для следующего рендера —
// именно ОТ них в следующий раз стартует анимация.
bossBarCache[boss.id] = {
hp: Math.min(100, barPct),
phases: boss.phases.map(p => Math.min(100, p.progress/p.target*100))
};
if(!isDefeated) {
const inputDiv = document.createElement("div");
inputDiv.innerHTML = `
${isActive ? `
<hr class="rule">
<label class="field">Внести ${unit} в текущую фазу (урон боссу)
<input class="bossAddInput" data-bossid="${boss.id}" type="number" min="1" placeholder="${isFinancial ? 'сумма в рублях' : 'кол-во ' + unit}" />
</label>
<div class="actions">
<button class="btn primary bossAddBtn" data-bossid="${boss.id}">Внести</button>
</div>` : ''}
${isFinancial ? `
<label class="field" style="margin-top:8px;">Вернуть ₽ из накоплений (отхил босса)
<input class="bossHealInput" data-bossid="${boss.id}" type="number" min="1" placeholder="сумма в рублях" />
</label>
<div class="actions">
<button class="btn warning bossHealBtn" data-bossid="${boss.id}">❤️ Отхилить</button>
</div>` : ''}
`;
div.appendChild(inputDiv);
}
list.appendChild(div);
});
startBossRemovalTimers();
// Полосы вставлены с их СТАРЫМИ значениями ширины — на следующем кадре
// проставляем настоящие цели, чтобы сработал CSS-переход (3с).
requestAnimationFrame(() => {
state.bosses.forEach(boss => {
const cache = bossBarCache[boss.id];
if (!cache) return;
const hpFill = document.getElementById(`bossHpFill_${boss.id}`);
if (hpFill) hpFill.style.width = cache.hp + '%';
boss.phases.forEach((p, i) => {
const phaseFill = document.getElementById(`bossPhaseFill_${boss.id}_${i}`);
if (phaseFill) phaseFill.style.width = cache.phases[i] + '%';
});
});
});
// Event listeners
document.querySelectorAll('[data-setactive]').forEach(btn => {
btn.addEventListener('click', () => {
const idx = parseInt(btn.dataset.setactive);
BossCore.setActive(idx);
persist(); renderAll();
toast(`Активный босс: ${state.bosses[idx].name}`);
});
});
document.querySelectorAll('.bossRetryRewardBtn').forEach(btn => {
btn.addEventListener('click', async () => {
const bossId = btn.dataset.bossid;
const boss = state.bosses.find(b => b.id === bossId);
if (!boss || boss.removeAt || boss.victoryRewarded || boss.victoryRewardGenerating) return;
await finalizeBossVictory(boss);
});
});

document.querySelectorAll('[data-delboss]').forEach(btn => {
btn.addEventListener('click', () => {
const idx = parseInt(btn.dataset.delboss);
const boss = state.bosses[idx];
showConfirm(
'⚠️ Удаление босса',
`Вы уверены, что хотите удалить босса "${boss.name}"? Весь прогресс будет потерян.`,
() => {
BossCore.remove(idx);
persist(); renderAll();
toast(`Босс "${boss.name}" удалён`);
}
);
});
});
function spawnBossHitEffect(anchor){
  if (!anchor) return;
  const host = anchor.closest('.card') || anchor;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const burst = document.createElement('div');
  burst.className = 'boss-hit-burst';
  for (let i = 0; i < 6; i++) {
    const shard = document.createElement('span');
    shard.style.setProperty('--dx', `${Math.cos((Math.PI * 2 * i) / 6) * 26}px`);
    shard.style.setProperty('--dy', `${Math.sin((Math.PI * 2 * i) / 6) * 18}px`);
    burst.appendChild(shard);
  }
  host.appendChild(burst);
  setTimeout(() => burst.remove(), 520);
}

function animateBossDamage(bossId, amount, oldHpPct, newHpPct, oldPhasePct, newPhasePct, isFinal){
  const card = document.querySelector(`[data-boss-card="${bossId}"]`);
  if (!card) return;
  card.classList.remove('boss-damage-impact', 'boss-damage-final');
  void card.offsetWidth;
  card.classList.add(isFinal ? 'boss-damage-final' : 'boss-damage-impact');

  const float = document.createElement('div');
  float.className = 'boss-damage-float';
  float.textContent = `⚔️ −${fmt(amount)} ₽`;
  card.appendChild(float);
  setTimeout(() => float.remove(), 900);

  const hpFill = document.getElementById(`bossHpFill_${bossId}`);
  if (hpFill && !isFinal){
    hpFill.style.transition = 'none';
    hpFill.style.width = oldHpPct + '%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      hpFill.style.transition = 'width .75s cubic-bezier(.25,.8,.25,1)';
      hpFill.style.width = newHpPct + '%';
    }));
  }
  const boss = state.bosses.find(b => b.id === bossId);
  if (boss && !isFinal){
    const phaseIndex = boss.phases.findIndex(p => !p.defeated);
    if (phaseIndex >= 0){
      const phaseFill = document.getElementById(`bossPhaseFill_${bossId}_${phaseIndex}`);
      if (phaseFill){
        phaseFill.style.transition = 'none';
        phaseFill.style.width = oldPhasePct + '%';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          phaseFill.style.transition = 'width .75s cubic-bezier(.25,.8,.25,1)';
          phaseFill.style.width = newPhasePct + '%';
        }));
      }
    }
  }
  setTimeout(() => card.classList.remove('boss-damage-impact', 'boss-damage-final'), 850);
}

function animateBossHeal(bossId, amount, oldHpPct, newHpPct, oldPhasePct, newPhasePct){
const card = document.querySelector(`[data-boss-card="${bossId}"]`);
if (!card) return;

card.classList.remove('boss-heal-impact');
void card.offsetWidth;
card.classList.add('boss-heal-impact');

const float = document.createElement('div');
float.className = 'boss-heal-float';
float.textContent = `❤️ +${fmt(amount)} ₽`;
card.appendChild(float);
setTimeout(() => float.remove(), 1000);

const hpFill = document.getElementById(`bossHpFill_${bossId}`);
if (hpFill){
  hpFill.style.transition = 'none';
  hpFill.style.width = oldHpPct + '%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hpFill.style.transition = 'width .9s cubic-bezier(.22,.7,.2,1)';
      hpFill.style.width = newHpPct + '%';
    });
  });
}

const boss = state.bosses.find(b => b.id === bossId);
if (boss){
  const phaseIndex = boss.phases.findIndex(p => !p.defeated);
  if (phaseIndex >= 0){
    const phaseFill = document.getElementById(`bossPhaseFill_${bossId}_${phaseIndex}`);
    if (phaseFill){
      phaseFill.style.transition = 'none';
      phaseFill.style.width = oldPhasePct + '%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          phaseFill.style.transition = 'width .9s cubic-bezier(.22,.7,.2,1)';
          phaseFill.style.width = newPhasePct + '%';
        });
      });
    }
  }
}

const cushionFlash = document.createElement('div');
cushionFlash.className = 'boss-cushion-heal';
cushionFlash.textContent = `💰 +${fmt(amount)} ₽`;
cushionFlash.setAttribute('aria-hidden', 'true');
document.body.appendChild(cushionFlash);
setTimeout(() => cushionFlash.remove(), 1000);
setTimeout(() => card.classList.remove('boss-heal-impact'), 900);
}

document.querySelectorAll('.bossHealBtn').forEach(btn => {
btn.addEventListener('click', () => {
const bossId = btn.dataset.bossid;
const input = document.querySelector(`.bossHealInput[data-bossid="${bossId}"]`);
const amount = Math.floor(Number(input.value));
if(!amount || amount <= 0){ toast("Укажи сумму для отхила"); return; }
const boss = state.bosses.find(b => b.id === bossId);
if(!boss || boss.bossType === 'other') return;
const phase = currentBossPhase(boss);
if(!phase){ toast("У босса нет активной фазы"); return; }
const oldRemaining = Math.max(0, boss.target - boss.phases.reduce((s, p) => s + Math.min(p.progress, p.target), 0));
const oldBossHpPct = Math.min(100, oldRemaining / boss.target * 100);
const oldPhasePct = Math.min(100, phase.progress / phase.target * 100);
const result = BossCore.heal(boss, amount);
if (!result.ok) { toast(result.message); return; }
input.value = "";
const newRemaining = Math.max(0, boss.target - boss.phases.reduce((s, p) => s + Math.min(p.progress, p.target), 0));
const newBossHpPct = Math.min(100, newRemaining / boss.target * 100);
const newPhasePct = Math.min(100, phase.progress / phase.target * 100);
logEvent('boss', '❤️', `${boss.name}: босс восстановил ${fmt(result.amount)} ₽`);
persist(); renderAll();
animateBossHeal(boss.id, result.amount, oldBossHpPct, newBossHpPct, oldPhasePct, newPhasePct);
toast(`❤️ Босс восстановил ${fmt(result.amount)} ₽`);
});
});

document.querySelectorAll('.bossAddBtn').forEach(btn => {
btn.addEventListener('click', async () => {
const bossId = btn.dataset.bossid;
const input = document.querySelector(`.bossAddInput[data-bossid="${bossId}"]`);
const amount = Math.floor(Number(input.value));
if(!amount || amount <= 0){ toast("Укажи сумму"); return; }
const boss = state.bosses.find(b => b.id === bossId);
if(!boss) return;
const beforeTotal = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const beforeRemaining = Math.max(0, boss.target - beforeTotal);
const beforeHpPct = Math.min(100, beforeRemaining / boss.target * 100);
const beforePhase = currentBossPhase(boss);
const beforePhasePct = beforePhase ? Math.min(100, beforePhase.progress / beforePhase.target * 100) : 0;
const result = BossCore.damage(boss, amount);
if (!result.ok) { toast(result.message); return; }
input.value = "";
(result.events || []).forEach(ev => logEvent(ev.type, ev.icon, ev.text));
if (typeof syncAchievements === 'function') syncAchievements();
const appliedDamage = result.appliedDamage;
const bossDefeated = result.defeated;
if (appliedDamage > 0) {
  persist(); renderAll();
  const hpBarEl = document.getElementById(`bossHpFill_${bossId}`);
  spawnBossHitEffect(hpBarEl ? hpBarEl.parentElement : document.querySelector(`[data-boss-card="${bossId}"]`));
  animateBossDamage(boss.id, appliedDamage, beforeHpPct, result.afterHpPct, beforePhasePct, result.afterPhasePct, bossDefeated);
}
if (!bossDefeated) {
for (let i = 0; i < result.defeatedThisHit.length; i++){
const phase = result.defeatedThisHit[i];
setTimeout(() => showPhaseBanner(boss.name, phase.name, phase.reward), i * 3200);
}
} else if (!boss.victoryRewarded) {
boss.victoryPending = true;
persist(); renderAll();
setTimeout(() => finalizeBossVictory(boss), 350);
}
});
});
}

async function finalizeBossVictory(boss){
if (!boss || boss.victoryRewarded || boss.victoryRewardGenerating) return;
boss.victoryPending = true;
if (!boss.victoryLogged) {
logEvent('boss', '👹', `Победа над ${boss.name}`);
boss.victoryLogged = true;
}
if (!aiAvailable) {
persist(); renderAll();
toast('🤖 AI сейчас недоступен. Когда он станет доступен, нажми «Повторить выдачу награды».');
return;
}
boss.victoryRewardGenerating = true;
persist(); renderAll();
try {
const result = await withAIThinking('🤖 Готовлю награду за победу...', () => generateBossVictoryRewardWithAI(boss));
let item = null;
if (result.item && result.item.name) {
item = addInventoryItem({ ...result.item, source: 'boss:' + boss.name });
}
if (result.achievement && result.achievement.title) {
if (typeof AchievementCore !== 'undefined') AchievementCore.registerCustomAchievement({
icon: result.achievement.icon || '🏆',
id: 'boss:' + Date.now(),
title: result.achievement.title,
desc: result.achievement.desc || '',
rank: 1
});
}
const bonusCoins = Number(result.bonusCoins) || 0;
if (bonusCoins) addCoins(bonusCoins, `Победа над ${boss.name}`);
persist(); renderAll();
showBossVictoryBanner(boss.name, { heroXP:0, coins: bonusCoins, skills:{} }, item ? [item] : []);
boss.victoryPending = false;
boss.victoryRewardGenerating = false;
boss.victoryRewarded = true;
armBossRemovalTimer(boss);
if (result.achievement && result.achievement.title) {
if (typeof queueAchievementUnlock === 'function') {
queueAchievementUnlock({ icon: result.achievement.icon || '🏆', title: result.achievement.title, desc: result.achievement.desc || 'Персональное достижение за победу над боссом.', rank: 'I', previousRank: null, currentValueText: 'Получено', nextThresholdText: null, unit: '', isMaxRank: false });
} else {
toast(`🏆 Новое достижение: ${result.achievement.title}`);
}
}
} catch(err) {
console.error(err);
boss.victoryRewardGenerating = false;
boss.victoryPending = true;
persist(); renderAll();
if (err.cancelled) {
toast('⏹ Генерация награды отменена. Босс повержен — награду можно выдать повторно.');
} else {
toast('❌ AI не смог выдать награду. Босс повержен — нажми «Повторить выдачу награды», когда AI снова будет доступен.');
}
}
}

function wireBossCreation(){
const typeEl = document.getElementById("bossNewType");
const targetLabel = document.getElementById("bossNewTargetLabel");
const unitWrap = document.getElementById("bossNewUnitWrap");
if (typeEl) {
typeEl.addEventListener("change", () => {
const isFinancial = typeEl.value === "financial";
if (targetLabel) targetLabel.firstChild.textContent = isFinancial ? "Целевая сумма, ₽" : "Целевая величина";
if (unitWrap) unitWrap.style.display = isFinancial ? "none" : "block";
});
}
const addBtn = document.getElementById("bossNewAdd");
if (!addBtn) return;
addBtn.addEventListener("click", () => {
const name = document.getElementById("bossNewName");
const goal = document.getElementById("bossNewGoal");
const target = document.getElementById("bossNewTarget");
const unitEl = document.getElementById("bossNewUnit");
if (!name || !goal || !target) return;
const bossType = typeEl ? typeEl.value : "financial";
const nameVal = name.value.trim();
const goalVal = goal.value.trim();
const targetVal = Number(target.value);
const unitVal = bossType === "financial" ? "₽" : ((unitEl && unitEl.value.trim()) || "ед.");
if(!nameVal){ toast("Укажи имя босса"); return; }
if(!goalVal){ toast("Укажи цель босса"); return; }
if(!targetVal || targetVal <= 0){ toast("Укажи корректную целевую величину"); return; }
// Награда за фазу — только XP персонажа и одного навыка, без монет:
// монеты боссы больше не платят, это не их роль в экономике.
const phaseSplit = bossType === "financial" ? [0.2, 0.3, 0.5] : [0.34, 0.33, 0.33];
const phaseRewards = [
{heroXP: 80, skills: {"💰 Финансы": 40}},
{heroXP: 150, skills: {"💰 Финансы": 70}},
{heroXP: 280, skills: {"💰 Финансы": 120}},
];
const romanNames = ["Фаза I", "Фаза II", "Фаза III"];
const boss = {
id: "boss_" + Date.now(),
name: nameVal,
goal: goalVal,
target: targetVal,
bossType,
unit: unitVal,
createdAt: Date.now(),
victoryRewarded: false,
phases: phaseSplit.map((frac, i) => ({
name: romanNames[i],
target: Math.round(targetVal * frac),
progress: 0,
defeated: false,
reward: phaseRewards[i],
applied: false
}))
};
if (!BossCore.create(boss)) return;
name.value = "";
goal.value = "";
target.value = "";
if (unitEl) unitEl.value = "";
persist(); renderAll();
toast(`Босс "${nameVal}" добавлен!`);
});
}

/* ===== js\inventory-core.js ===== */
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


/* ===== js\shop-core.js ===== */
"use strict";


/*
 * Shop Core
 * Игровая логика магазина не зависит от DOM.
 */
const ShopCore = (() => {
  function addItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (!Array.isArray(S().shop)) S().shop = [];

    const normalized = {
      name: String(item.name || '✨ Загадочный товар'),
      price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : 30,
      rarity: RARITY_ORDER.includes(item.rarity) ? item.rarity : 'common',
      effect: String(item.effect || ''),
      durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
      secondaryEffect: String(item.secondaryEffect || ''),
      secondaryDurationMinutes: item.secondaryDurationMinutes
        ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15)
        : 0,
      quote: String(item.quote || '')
    };

    S().shop.push(normalized);
    return normalized;
  }

  function removeItem(index) {
    if (!Array.isArray(S().shop)) return null;
    if (!Number.isInteger(index) || index < 0 || index >= S().shop.length) return null;
    return S().shop.splice(index, 1)[0] || null;
  }

  function buyItem(index) {
    if (!Array.isArray(S().shop)) return { ok: false, reason: 'shop_empty' };
    if (!Number.isInteger(index) || index < 0 || index >= S().shop.length) {
      return { ok: false, reason: 'invalid_item' };
    }

    const item = S().shop[index];
    const price = Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : NaN;
    if (!Number.isFinite(price) || price < 0) return { ok: false, reason: 'invalid_price' };
    if (S().character.coins < price) return { ok: false, reason: 'not_enough_coins', item };

    addCoins(-price, item.name);
    const inventoryItem = InventoryCore.add({
      name: item.name,
      type: 'consumable',
      rarity: item.rarity || rollConsumableRarity(),
      desc: '',
      effect: item.effect || '',
      durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
      secondaryEffect: item.secondaryEffect || '',
      secondaryDurationMinutes: item.secondaryDurationMinutes
        ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15)
        : 0,
      quote: item.quote || '',
      source: 'shop'
    });

    return { ok: true, item, inventoryItem, price };
  }

  return { addItem, removeItem, buyItem };
})();

/* ===== js\economy.js ===== */
"use strict";

function renderEconomy(){
const elCoins = document.getElementById("coinsBig");
const log = document.getElementById("coinLog");
const shop = document.getElementById("shopList");
const shopStatus = document.getElementById("shopStatus");
if (elCoins) elCoins.textContent = fmt(state.character.coins) + " 🪙";
if (log) {
log.innerHTML = "";
const last5 = [...state.coinLog].slice(-5);
last5.forEach(l=>{
const row = document.createElement("div");
row.className = "log-row";
const deltaStr = l.delta === 0 ? "" : (l.delta > 0 ? "+"+l.delta : l.delta) + "🪙";
row.innerHTML = `<span>${l.label}</span><span class="delta ${l.delta<0?'neg':'pos'}">${deltaStr} <span class="muted">(${fmt(l.running)})</span></span>`;
log.appendChild(row);
});
}
if (shopStatus) {
shopStatus.textContent = "Статус: активен";
}
if (shop) {
shop.innerHTML = "";
state.shop.forEach((item, idx)=>{
const row = document.createElement("div");
row.className = "shop-item";
const priceStr = item.price === null ? "цена не зафиксирована" : item.price + "🪙";
row.innerHTML = `
<div>
<div>${escapeHtml(item.name)}</div>
${item.rarity ? `<span class="rarity ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span>` : ''}
${item.effect ? `<div class="trait" style="margin-top:2px;">✨ ${escapeHtml(item.effect)}${item.durationMinutes ? ` · ${normalizeConsumableDuration(item.durationMinutes)} мин` : ''}</div>` : ''}
${item.secondaryEffect ? `<div class="sub" style="margin-top:2px;">↘ ${escapeHtml(item.secondaryEffect)}</div>` : ''}
${item.quote ? `<div class="item-quote">«${escapeHtml(item.quote)}»</div>` : ''}
</div>
<div>
<span>${priceStr}</span>
${item.price!==null ? '<button class="btn" data-buy="'+idx+'">Купить</button>' : ''}
<button class="btn danger" data-delshop="${idx}" style="padding:6px 8px;">🗑 Убрать</button>
</div>
`;
const buyBtn = row.querySelector("[data-buy]");
if(buyBtn) buyBtn.addEventListener("click", async ()=>{
const result = ShopCore.buyItem(idx);
if (!result.ok) {
if (result.reason === 'not_enough_coins') toast("Недостаточно монет");
else toast("Не удалось купить товар");
return;
}
persist(); renderAll();
toast(`Куплено: ${item.name}`);
});
const delBtn = row.querySelector("[data-delshop]");
if(delBtn) delBtn.addEventListener("click", ()=>{
showConfirm(
'🗑️ Убрать из продажи',
`Безвозвратно убрать "${item.name}" из магазина?`,
() => {
const removed = ShopCore.removeItem(idx);
if (!removed) return;
persist(); renderAll();
toast("Товар убран из продажи");
}
);
});
shop.appendChild(row);
});
}
}

/* ===== js\shop.js ===== */
"use strict";

function wireShopCreation(){
const addBtn = document.getElementById("shopNewAdd");
if (!addBtn) return;
addBtn.addEventListener("click", () => {
const name = document.getElementById("shopNewName");
const price = document.getElementById("shopNewPrice");
const rarity = document.getElementById("shopNewRarity");
const effect = document.getElementById("shopNewEffect");
const duration = document.getElementById("shopNewDuration");
if (!name || !price) return;
const nameVal = name.value.trim();
const priceVal = Math.trunc(Number(price.value));
const effectVal = effect ? effect.value.trim() : '';
const durationVal = normalizeConsumableDuration(duration ? duration.value : 30, 30);
if(!nameVal){ toast("Укажи название товара"); return; }
if(!priceVal || priceVal < 0){ toast("Укажи корректную цену"); return; }
if(!effectVal){ toast("Для расходника укажи бафф"); return; }
ShopCore.addItem({name: nameVal, price: priceVal, rarity: RARITY_ORDER.includes(rarity?.value) ? rarity.value : 'common', effect: effectVal, durationMinutes: durationVal, quote: ''});
name.value = "";
price.value = "";
if (effect) effect.value = "";
if (duration) duration.value = "";
persist(); renderAll();
toast(`Товар "${nameVal}" добавлен в магазин!`);
});
}

function wireShopAI(){
const genBtn = document.getElementById('aiShopGenerateBtn');
if (genBtn) {
genBtn.addEventListener('click', async () => {
if (!aiAvailable) { toast('🤖 AI недоступен'); return; }
const theme = (document.getElementById('aiShopTheme')?.value || '').trim();
try {
const item = await withAIThinking('🤖 Придумываю товар...', () => generateShopItemWithAI(theme));
ShopCore.addItem({
name: item.name || '✨ Загадочный товар',
price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : 30,
rarity: rollConsumableRarity(),
effect: item.effect || '',
durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
secondaryEffect: item.secondaryEffect || '',
secondaryDurationMinutes: item.secondaryDurationMinutes ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15) : 0,
quote: item.quote || ''
});
persist(); renderAll();
toast(`✅ Добавлено: ${item.name}`);
} catch(err) {
toastAIError(err);
}
});
}
}

/* ===== js\inventory.js ===== */
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

/* ===== js\equipment-core.js ===== */
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

/* ===== js\equipment.js ===== */
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

/* ===== js\crafting-core.js ===== */
"use strict";


function getCraftGenerationLimitState(){
if (S().character.craftGenLevel !== S().character.level) {
S().character.craftGenLevel = S().character.level;
S().character.craftGenCount = 0;

}
return { count: Number(S().character.craftGenCount) || 0, limit: 3 };
}


function craftRecipe(idx){
const recipe = S().craftRecipes[idx];
if (!recipe) return { ok:false, reason:'recipe_not_found' };
const normalizedMaterials = (recipe.materials || []).map(m => typeof m === 'string' ? ({name:m, qty:1}) : m);
if (normalizedMaterials.length < 2) return { ok:false, reason:'invalid_recipe' };
for (const mat of normalizedMaterials) {
const qty = Math.max(1, Math.floor(Number(mat.qty) || 1));
const item = S().inventory.find(i => i.name === mat.name && (i.qty||1) >= qty);
if (!item) return { ok:false, reason:'missing_material', material: mat.name, qty };
}
for (const mat of normalizedMaterials) {
const qty = Math.max(1, Math.floor(Number(mat.qty) || 1));
const mIdx = S().inventory.findIndex(i => i.name === mat.name);
const item = S().inventory[mIdx];
item.qty = (item.qty || 1) - qty;
if (item.qty <= 0) S().inventory.splice(mIdx, 1);
}
const isConsumable = recipe.type === 'consumable';
const result = InventoryCore.add(isConsumable ? {
name: recipe.name, type: 'consumable', category: recipe.category || 'Эликсир', rarity: recipe.rarity || 'common',
desc: recipe.desc || `Скрафчено из: ${normalizedMaterials.map(m => `${m.name} ×${Number(m.qty)||1}`).join(', ')}`,
effect: recipe.effect || '', durationMinutes: normalizeConsumableDuration(recipe.durationMinutes, 30),
secondaryEffect: recipe.secondaryEffect || '', secondaryDurationMinutes: recipe.secondaryDurationMinutes ? normalizeConsumableDuration(recipe.secondaryDurationMinutes, 15) : 0,
source: 'craft'
} : {
name: recipe.name, type: 'equipment', category: recipe.category || recipe.slot || 'Аксессуар', rarity: recipe.rarity || 'common',
desc: recipe.desc || `Скрафчено из: ${normalizedMaterials.map(m => `${m.name} ×${Number(m.qty)||1}`).join(', ')}`, effect: recipe.effect || '',
slot: recipe.slot || SLOT_ORDER[0], itemLevel: Number(recipe.itemLevel) > 0 ? Math.floor(Number(recipe.itemLevel)) : (Number(S().character?.level) || 1), source: 'craft'
});
return { ok:true, item: result, events:[{ type:'craft', icon:isConsumable ? '🧪' : '🛠️', text:`Создан ${isConsumable ? 'расходник' : 'предмет'}: ${result.name}` }] };
}


function addCraftRecipe(recipe){
  if (!recipe) return false;
  S().craftRecipes.push(recipe);
  S().character.craftGenCount = (Number(S().character.craftGenCount) || 0) + 1;
  return true;
}

function deleteCraftRecipe(idx){
  const index = Number(idx);
  if (!Number.isInteger(index) || index < 0 || index >= S().craftRecipes.length) return { ok:false, reason:'recipe_not_found' };
  const recipe = S().craftRecipes[index];
  S().craftRecipes.splice(index, 1);
  return { ok:true, recipe };
}

/* ===== js\crafting.js ===== */
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

/* ===== js\achievements-core.js ===== */
"use strict";


const ACHIEVEMENT_DEFINITIONS = [
    { id:'quests', icon:'⚔️', title:'Путь героя', desc:'Выполнить указанное количество любых квестов.', unit:'квестов', thresholds:[10,25,60,150,300,500,1500,3500,5000,10000], type:'count' },
    { id:'coins', icon:'💰', title:'Состояние', desc:'Заработать указанное количество монет за всё время.', unit:'монет', thresholds:[1000,2500,6000,15000,30000,60000,150000,250000,500000,1000000], type:'count' },
    { id:'activity', icon:'⏱️', title:'Жизнь в движении', desc:'Накопить указанное количество времени активности.', unit:'часов', thresholds:[1,2.5,6,12,24,72,150,250,500,1000], type:'hours' },
    { id:'power', icon:'⚔️', title:'Восхождение', desc:'Достичь указанного значения показателя «Мощь».', unit:'Мощи', thresholds:[500,1000,2500,5000,10000,20000,40000,75000,125000,200000], type:'current' },
    { id:'level', icon:'⭐', title:'Новый уровень', desc:'Достичь указанного уровня персонажа.', unit:'уровень', thresholds:[5,15,30,75,100,150,300,600,800,1000], type:'current' },
    { id:'skills', icon:'🌳', title:'Мастерство', desc:'Накопить указанное суммарное количество уровней навыков.', unit:'уровней', thresholds:[10,25,60,150,300,600,1500,2000,3500,5000], type:'current' },
    { id:'attributes', icon:'🧬', title:'Совершенствование', desc:'Накопить указанное количество повышений атрибутов.', unit:'повышений', thresholds:[5,15,30,75,100,150,300,600,800,1000], type:'count' },
    { id:'equipment', icon:'🛡️', title:'Арсенал', desc:'Получить указанное количество уникальных единиц снаряжения.', unit:'предметов', thresholds:[5,10,20,50,75,100,150,200,300,500], type:'count' },
    { id:'consumables', icon:'🧪', title:'Расходный материал', desc:'Использовать указанное количество расходников.', unit:'использований', thresholds:[10,25,60,150,300,600,1200,2000,3500,5000], type:'count' },
    { id:'inventory', icon:'🎒', title:'Собиратель', desc:'Получить указанное количество отдельных предметов в инвентарь.', unit:'предметов', thresholds:[10,50,150,300,750,1500,3000,5000,10000,15000], type:'count' },
];

const ACHIEVEMENT_RANKS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

function createAchievementState(){
    return ACHIEVEMENT_DEFINITIONS.map(def => ({ id:def.id, icon:def.icon, title:def.title, desc:def.desc, rank:0, unlocked:false }));
}

function ensureAchievementStats(){
    if (!S().achievementStats || typeof S().achievementStats !== 'object') S().achievementStats = {};
    const s = S().achievementStats;
    s.coinsEarned = Math.max(0, Number(s.coinsEarned) || 0);
    s.attributeUpgrades = Math.max(0, Number(s.attributeUpgrades) || 0);
    s.consumablesUsed = Math.max(0, Number(s.consumablesUsed) || 0);
    s.inventoryItemsObtained = Math.max(0, Number(s.inventoryItemsObtained) || 0);
    s.equipmentUniqueNames = Array.isArray(s.equipmentUniqueNames) ? [...new Set(s.equipmentUniqueNames.filter(Boolean))] : [];
    return s;
}

function achievementValue(id){
    ensureAchievementStats();
    const s = S().achievementStats;
    switch(id){
        case 'quests': return Number(S().quests?.stats?.completed) || 0;
        case 'coins': return s.coinsEarned;
        case 'activity': return (Number(S().totalActivitySeconds) || 0) / 3600;
        case 'power': return Number(typeof getProfilePower === 'function' ? getProfilePower() : 0) || 0;
        case 'level': return Number(S().character?.level) || 0;
        case 'skills': return Object.values(S().skills || {}).reduce((sum, xp) => sum + (typeof getSkillLevel === 'function' ? getSkillLevel(Number(xp)||0) : 0), 0);
        case 'attributes': return s.attributeUpgrades;
        case 'equipment': return s.equipmentUniqueNames.length;
        case 'consumables': return s.consumablesUsed;
        case 'inventory': return s.inventoryItemsObtained;
        default: return 0;
    }
}

function formatAchievementValue(value, def){
    if (def.type === 'hours') return Number.isInteger(value) ? fmt(value) : String(Number(value.toFixed(1))).replace('.', ',');
    return fmt(Math.floor(value));
}

function syncAchievementsCore(){
    if (!Array.isArray(S().achievements)) S().achievements = createAchievementState();
    const byId = new Map(S().achievements.map(a => [a.id, a]));
    const changed = [];
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
        let a = byId.get(def.id);
        if (!a) {
            a = {id:def.id, icon:def.icon, title:def.title, desc:def.desc, rank:0, unlocked:false};
            S().achievements.push(a);
        }
        a.icon = def.icon;
        a.title = def.title;
        a.desc = def.desc;
        const value = achievementValue(def.id);
        let rank = 0;
        def.thresholds.forEach((threshold, index) => { if (value >= threshold) rank = index + 1; });
        const oldRank = Math.max(0, Number(a.rank) || 0);
        a.rank = rank;
        a.unlocked = rank > 0;
        if (rank > oldRank) changed.push({def, rank, oldRank});
    });
    S().achievements = S().achievements.filter(a => a && (String(a.id || '').startsWith('boss:') || ACHIEVEMENT_DEFINITIONS.some(d => d.id === a.id)));
    return changed;
}

function registerCoinsEarned(amount){
    if (!amount || amount <= 0) return;
    ensureAchievementStats().coinsEarned += Number(amount);
}
function registerAttributeUpgrade(){
    ensureAchievementStats().attributeUpgrades += 1;
}
function registerConsumableUsed(){
    ensureAchievementStats().consumablesUsed += 1;
}
function registerInventoryObtained(amount=1){
    if (amount > 0) ensureAchievementStats().inventoryItemsObtained += Number(amount);
}
function registerCustomAchievement(achievement){
    if (!achievement || !achievement.title) return null;
    if (!Array.isArray(S().achievements)) S().achievements = createAchievementState();
    const entry = {
        icon: achievement.icon || '🏆',
        id: achievement.id || ('custom:' + Date.now()),
        title: String(achievement.title),
        desc: String(achievement.desc || ''),
        unlocked: true,
        rank: Math.max(1, Number(achievement.rank) || 1)
    };
    S().achievements.push(entry);
    return entry;
}

function registerEquipmentObtained(name){
    if (!name) return;
    const s = ensureAchievementStats();
    if (!s.equipmentUniqueNames.includes(name)) s.equipmentUniqueNames.push(name);
}

const AchievementCore = Object.freeze({
    ensureStats: ensureAchievementStats,
    value: achievementValue,
    formatValue: formatAchievementValue,
    sync: syncAchievementsCore,
    registerCoinsEarned,
    registerAttributeUpgrade,
    registerConsumableUsed,
    registerInventoryObtained,
    registerEquipmentObtained,
    registerCustomAchievement
});

/* ===== js\achievements.js ===== */
"use strict";

function handleAchievementChanges(changed){
    if (!Array.isArray(changed) || !changed.length) return;
    changed.forEach(({def, rank, oldRank}) => {
        const rankText = ACHIEVEMENT_RANKS[rank - 1];
        const previousRankText = oldRank > 0 ? ACHIEVEMENT_RANKS[oldRank - 1] : null;
        logEvent('achievement', def.icon, `Получено достижение: «${def.title}» ранг — ${rankText}`);
        if (typeof queueAchievementUnlock === 'function') {
            const currentValue = achievementValue(def.id);
            const nextThreshold = rank < def.thresholds.length ? def.thresholds[rank] : null;
            queueAchievementUnlock({
                icon: def.icon,
                title: def.title,
                desc: def.desc,
                rank: rankText,
                previousRank: previousRankText,
                currentValue,
                currentValueText: formatAchievementValue(currentValue, def),
                unit: def.unit,
                nextThreshold,
                nextThresholdText: nextThreshold !== null ? formatAchievementValue(nextThreshold, def) : null,
                isMaxRank: rank >= 10
            });
        } else if (typeof toast === 'function') {
            toast(`🏆 Получено достижение: «${def.title}» ранг — ${rankText}`);
        }
    });
}

function syncAchievements({silent=false} = {}){
    const changed = AchievementCore.sync();
    if (!silent && changed.length) {
        handleAchievementChanges(changed);
        if (typeof persist === 'function') persist();
    }
    return changed;
}



function renderAchievements(){
    const list = document.getElementById("achList");
    if (!list) return;
    syncAchievements({silent:true});
    list.innerHTML = "";
    ACHIEVEMENT_DEFINITIONS.forEach(def => {
        const a = state.achievements.find(x => x.id === def.id) || {rank:0};
        const rank = Number(a.rank) || 0;
        const value = achievementValue(def.id);
        const next = rank < 10 ? def.thresholds[rank] : null;
        const current = rank > 0 ? def.thresholds[rank - 1] : 0;
        const progress = next === null ? 100 : Math.min(100, Math.max(0, ((value - current) / Math.max(1, next - current)) * 100));
        const rankText = rank > 0 ? ACHIEVEMENT_RANKS[rank - 1] : '—';
        const status = rank >= 10 ? 'X · МАКСИМАЛЬНЫЙ РАНГ' : rank > 0 ? `Ранг ${rankText} · следующий ${ACHIEVEMENT_RANKS[rank]}` : `До ранга I: ${formatAchievementValue(Math.max(0, def.thresholds[0] - value), def)} ${def.unit}`;
        const targetText = rank >= 10 ? `${formatAchievementValue(def.thresholds[9], def)} ${def.unit}` : `${formatAchievementValue(value, def)} / ${formatAchievementValue(next, def)} ${def.unit}`;
        const div = document.createElement("div");
        div.className = "ach achievement-tier";
        div.innerHTML = `<div class="icon">${escapeHtml(def.icon)}</div><div class="achievement-main"><div class="achievement-title"><b>${escapeHtml(def.title)}</b><span class="achievement-rank">${escapeHtml(rankText)}</span></div><p>${escapeHtml(def.desc)}</p><div class="achievement-progress-text"><span>${escapeHtml(targetText)}</span><span>${escapeHtml(status)}</span></div><div class="bar"><span style="width:${progress}%"></span></div></div>`;
        list.appendChild(div);
    });

    const bossAchievements = state.achievements.filter(a => String(a?.id || '').startsWith('boss:'));
    if (bossAchievements.length) {
        const heading = document.createElement('div');
        heading.className = 'achievement-category';
        heading.innerHTML = '<h3>👹 Достижения за боссов</h3>';
        list.appendChild(heading);
    }
    bossAchievements.forEach(a => {
        const div = document.createElement('div');
        div.className = 'ach achievement-tier';
        div.innerHTML = `<div class="icon">${escapeHtml(a.icon || '🏆')}</div><div class="achievement-main"><div class="achievement-title"><b>${escapeHtml(a.title || 'Достижение босса')}</b><span class="achievement-rank">🏆</span></div><p>${escapeHtml(a.desc || 'Персональное достижение за победу над боссом.')}</p><div class="achievement-progress-text"><span>Получено</span><span>Победа над боссом</span></div></div>`;
        list.appendChild(div);
    });
}

/* ===== js\journal.js ===== */
"use strict";

const JOURNAL_MAX = JournalCore.MAX;
const JOURNAL_MAX_AGE_DAYS = JournalCore.MAX_AGE_DAYS;

function pruneJournal() {
  return JournalCore.prune();
}

let journalTypeFilter = 'all';
let journalDateFilter = 'all';

const JOURNAL_TYPES = [
  { id: 'all', label: 'Все' },
  { id: 'quest', label: '⚔️ Квесты' },
  { id: 'progress', label: '⬆️ Прогресс' },
  { id: 'reward', label: '🎁 Награды' },
  { id: 'boss', label: '👹 Боссы' },
  { id: 'item', label: '🎒 Предметы' },
];

const JOURNAL_TYPE_GROUPS = {
  quest: ['quest'],
  progress: ['level', 'xp', 'skill', 'perk'],
  reward: ['coins', 'achievement'],
  boss: ['boss'],
  item: ['item', 'craft'],
};

function journalEventMatchesType(ev) {
  if (journalTypeFilter === 'all') return true;
  const allowed = JOURNAL_TYPE_GROUPS[journalTypeFilter];
  return allowed ? allowed.includes(ev.type) : false;
}

function journalEventMatchesDate(ev) {
  const now = Date.now();
  if (journalDateFilter === 'today') {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return ev.ts >= d.getTime();
  }
  if (journalDateFilter === 'week')  return ev.ts >= now - 7  * 86400000;
  if (journalDateFilter === 'month') return ev.ts >= now - 30 * 86400000;
  return true;
}

function formatJournalDate(ts) {
  const d = new Date(ts);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  if (d >= today) return `📅 Сегодня · ${dd}.${mm}.${yyyy}`;
  if (d >= yesterday) return `📅 Вчера · ${dd}.${mm}.${yyyy}`;
  return `📅 ${dd}.${mm}.${yyyy}`;
}

function formatJournalTime(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function renderJournal() {
  const list = document.getElementById('journalList');
  if (!list) return;

  pruneJournal();

  const typeWrap = document.getElementById('journalTypeFilters');
  if (typeWrap) {
    typeWrap.innerHTML = JOURNAL_TYPES.map(t =>
      `<button class="btn ${journalTypeFilter === t.id ? 'active' : ''}" data-jtype="${t.id}">${t.label}</button>`
    ).join('');
    typeWrap.querySelectorAll('[data-jtype]').forEach(btn => {
      btn.addEventListener('click', () => {
        journalTypeFilter = btn.dataset.jtype;
        renderJournal();
      });
    });
  }

  const dateWrap = document.getElementById('journalDateFilters');
  if (dateWrap) {
    const opts = [
      { id: 'all',   label: 'Всё время' },
      { id: 'today', label: 'Сегодня' },
      { id: 'week',  label: '7 дней' },
      { id: 'month', label: '30 дней' },
    ];
    dateWrap.innerHTML = opts.map(o =>
      `<button class="btn ${journalDateFilter === o.id ? 'active' : ''}" data-jdate="${o.id}">${o.label}</button>`
    ).join('');
    dateWrap.querySelectorAll('[data-jdate]').forEach(btn => {
      btn.addEventListener('click', () => {
        journalDateFilter = btn.dataset.jdate;
        renderJournal();
      });
    });
  }

  const events = (state.journal || []).filter(ev =>
    journalEventMatchesType(ev) && journalEventMatchesDate(ev)
  );

  if (!events.length) {
    list.innerHTML = `<div class="empty">Событий пока нет.</div>`;
    return;
  }

  const groups = new Map();
  events.forEach(ev => {
    const d = new Date(ev.ts); d.setHours(0, 0, 0, 0);
    const key = d.getTime();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ev);
  });

  list.innerHTML = Array.from(groups.entries()).map(([dayTs, evs]) => {
    const rows = evs.map(ev => `
      <div class="journal-event journal-type-${ev.type}">
        <span class="journal-event-icon">${escapeHtml(ev.icon)}</span>
        <span class="journal-event-text">${escapeHtml(ev.text)}</span>
        <span class="journal-event-time">${formatJournalTime(ev.ts)}</span>
      </div>
    `).join('');
    return `<div class="journal-day">
      <div class="journal-day-head">${formatJournalDate(dayTs)}</div>
      ${rows}
    </div>`;
  }).join('');
}

function clearJournal() {
  showConfirm(
    '🗑 Очистить журнал',
    'Удалить всю историю событий? Действие необратимо.',
    () => {
      JournalCore.clear();
      persist(); renderJournal();
      toast('Журнал очищен');
    }
  );
}

function wireJournal() {
  const clearBtn = document.getElementById('journalClearBtn');
  if (clearBtn) clearBtn.addEventListener('click', clearJournal);
}
/* ===== js\profile.js ===== */
"use strict";

const PROFILE_SPECIAL_ORDER = [
    { letter: "S", key: "💪 Сила" },
    { letter: "P", key: "👁️ Восприятие" },
    { letter: "E", key: "🛡️ Выносливость" },
    { letter: "C", key: "🗣️ Харизма" },
    { letter: "I", key: "🧠 Интеллект" },
    { letter: "A", key: "⚡ Ловкость" },
    { letter: "L", key: "🎲 Удача" },
];

function getProfileEquipmentItems(){
    const result = [];
    Object.entries(state.equipment || {}).forEach(([slot, item]) => {
        if (item) result.push({ slot, item });
    });
    Object.entries(state.accessories || {}).forEach(([slot, items]) => {
        (Array.isArray(items) ? items : []).forEach((item, index) => {
            if (item) result.push({ slot, item, index });
        });
    });
    return result;
}

function getProfileInventoryCount(){
    return (state.inventory || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0);
}


function renderProfileBuffs(){
    const el = document.getElementById('profileActiveBuffs');
    if (!el) return;
    const effects = typeof getActiveEffects === 'function' ? getActiveEffects() : [];
    if (!effects.length) {
        el.innerHTML = '<div class="profile-effects-empty">Сейчас нет действующих эффектов.</div>';
        return;
    }
    const now = Date.now();
    const permanent = effects.filter(e => e.durationType === 'permanent').length;
    const timed = effects.length - permanent;
    const negative = effects.filter(e => e.type === 'negative').length;
    el.innerHTML = `
        <div class="profile-effects-summary">
            <span><b>${effects.length}</b> эффектов</span>
            <span><b>${timed}</b> временных</span>
            <span><b>${permanent}</b> постоянных</span>
            ${negative ? `<span class="negative"><b>${negative}</b> негативных</span>` : ''}
        </div>
        <div class="profile-effects-list">
            ${effects.map(e => {
                const pending = Number(e.startsAt) > now;
                const remaining = pending ? Number(e.startsAt) - now : (e.durationType === 'permanent' ? null : Number(e.expiresAt) - now);
                const negativeClass = e.type === 'negative' ? ' negative' : '';
                const source = typeof getActiveEffectSourceLabel === 'function' ? getActiveEffectSourceLabel(e) : 'Источник';
                const duration = e.durationType === 'permanent'
                    ? '♾️ Постоянный эффект'
                    : (pending ? `⏳ Активация через ${formatBuffDuration(remaining)}` : `⏱ Осталось ${formatBuffDuration(remaining)}`);
                return `
                    <div class="profile-effect-row${negativeClass}">
                        <div class="profile-effect-icon">${escapeHtml(e.icon || '✨')}</div>
                        <div class="profile-effect-content">
                            <div class="profile-effect-top">
                                <b>${escapeHtml(e.name || 'Активный эффект')}</b>
                                <span class="profile-effect-source">${escapeHtml(source)}</span>
                            </div>
                            <div class="profile-effect-value">${escapeHtml(e.effect || 'Эффект не указан')}</div>
                            <div class="profile-effect-meta">${escapeHtml(duration)}${e.stack > 1 ? ` · ×${e.stack}` : ''}</div>
                        </div>
                    </div>`;
            }).join('')}
        </div>`;
}

function renderProfileAdditional(){
    const statsEl = document.getElementById('profileProgressStats');
    const achievementsEl = document.getElementById('profileAchievementsList');
    if (!statsEl && !achievementsEl) return;

    const questStats = state.quests?.stats || { completed: 0, failed: 0, aborted: 0 };
    const completed = Number(questStats.completed) || 0;
    const failed = Number(questStats.failed) || 0;
    const aborted = Number(questStats.aborted) || 0;
    const resolved = completed + failed + aborted;
    const completionRate = resolved ? Math.round(completed / resolved * 100) : 0;
    const totalSkillXP = Object.values(state.skills || {}).reduce((sum, xp) => sum + (Number(xp) || 0), 0);
    const totalSkillLevels = Object.values(state.skills || {}).reduce((sum, xp) => sum + getSkillLevel(Number(xp) || 0), 0);
    const achievements = Array.isArray(state.achievements) ? state.achievements : [];
    const unlockedAchievements = achievements.filter(a => a.unlocked).length;
    const perks = Array.isArray(state.perksUnlocked) ? state.perksUnlocked.length : 0;
    const totalActivitySeconds = Number(state.totalActivitySeconds) || 0;

    if (statsEl) {
        statsEl.innerHTML = `
            <div class="profile-progress-stat"><b>${fmt(completed)}</b><span>Квестов завершено</span></div>
            <div class="profile-progress-stat"><b>${fmt(completionRate)}%</b><span>Процент завершения</span></div>
            <div class="profile-progress-stat"><b>${fmt(totalSkillXP)}</b><span>XP навыков</span></div>
            <div class="profile-progress-stat"><b>${fmt(totalSkillLevels)}</b><span>Сумма уровней навыков</span></div>
            <div class="profile-progress-stat"><b>${fmt(unlockedAchievements)}/${fmt(achievements.length)}</b><span>Достижений открыто</span></div>
            <div class="profile-progress-stat"><b>${fmt(perks)}</b><span>Перков разблокировано</span></div>
            <div class="profile-progress-stat"><b>${formatActivityDuration(totalActivitySeconds)}</b><span>Время активности</span></div>
        `;
    }

    if (achievementsEl) {
        achievementsEl.innerHTML = achievements.length ? achievements.map(a => `
            <div class="profile-achievement-item ${a.unlocked ? '' : 'locked'}">
                <span class="profile-achievement-icon">${escapeHtml(a.icon || '🏆')}</span>
                <div class="profile-achievement-main">
                    <b>${escapeHtml(a.title || 'Без названия')}${a.rank ? ` · Ранг ${escapeHtml(ACHIEVEMENT_RANKS[Math.max(0, Number(a.rank) - 1)] || '—')}` : ''}</b>
                    <span>${escapeHtml(a.desc || (a.unlocked ? 'Достижение разблокировано.' : 'Условие ещё не выполнено.'))}</span>
                </div>
                <strong>${a.rank >= 10 ? 'X' : (a.rank ? '✓' : '🔒')}</strong>
            </div>
        `).join('') : `<div class="empty">Достижений пока нет.</div>`;
    }
}

function animatePowerValue(el, targetValue){
    if (!el) return;
    const target = Number(targetValue) || 0;
    const previous = el.dataset.powerValue === undefined ? null : Number(el.dataset.powerValue);

    if (previous === null || !Number.isFinite(previous) || previous === target) {
        el.textContent = fmt(target);
        el.dataset.powerValue = String(target);
        return;
    }

    if (el._powerAnimationFrame) cancelAnimationFrame(el._powerAnimationFrame);
    if (el._powerAnimationTimer) clearTimeout(el._powerAnimationTimer);

    const delta = target - previous;
    const directionClass = delta > 0 ? 'power-increase' : 'power-decrease';
    el.classList.remove('power-increase', 'power-decrease');
    void el.offsetWidth;
    el.classList.add(directionClass);

    const startTime = performance.now();
    const duration = 1040;
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const step = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        const value = Math.round(previous + (target - previous) * easeOut(progress));
        el.textContent = fmt(value);
        if (progress < 1) {
            el._powerAnimationFrame = requestAnimationFrame(step);
        } else {
            el.dataset.powerValue = String(target);
            el._powerAnimationFrame = null;
            el._powerAnimationTimer = setTimeout(() => {
                el.classList.remove('power-increase', 'power-decrease');
            }, 440);
        }
    };

    el._powerAnimationFrame = requestAnimationFrame(step);
}

function getProfilePowerBreakdown(){
    const level = Number(state.character?.level) || 0;
    const levelPower = level * POWER_CHARACTER_LEVEL;
    const specialSum = PROFILE_SPECIAL_ORDER.reduce((sum, entry) => sum + (typeof getEffectiveSpecialValue === 'function' ? getEffectiveSpecialValue(entry.key) : (Number(state.special?.[entry.key]) || 0)), 0);
    const specialPower = specialSum * POWER_SPECIAL_PER_POINT;
    const skillLevelSum = Object.keys(state.skills || {}).reduce((sum, skillName) => sum + (typeof getEffectiveSkillLevel === 'function' ? getEffectiveSkillLevel(skillName) : getSkillLevel(Number(state.skills?.[skillName]) || 0)), 0);
    const skillPower = skillLevelSum * POWER_SKILL_PER_LEVEL;
    const equipmentPower = getProfileEquipmentItems().reduce((sum, { item }) => sum + getEquipmentPower(item), 0);
    return { specialPower, skillPower, equipmentPower, levelPower, total: specialPower + skillPower + equipmentPower + levelPower };
}

function getProfilePower(){
    return getProfilePowerBreakdown().total;
}

function renderProfilePowerBreakdown(){
    const el = document.getElementById('profilePowerBreakdown');
    if (!el) return;
    const b = getProfilePowerBreakdown();
    el.innerHTML = `
        <div class="profile-power-breakdown-row"><span>SPECIAL</span><b>+${fmt(b.specialPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>НАВЫКИ</span><b>+${fmt(b.skillPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>ПРЕДМЕТЫ</span><b>+${fmt(b.equipmentPower)}</b></div>
        <div class="profile-power-breakdown-row"><span>УРОВЕНЬ</span><b>+${fmt(b.levelPower)}</b></div>
        <div class="profile-power-breakdown-total"><span>ИТОГО</span><b>${fmt(b.total)}</b></div>
    `;
}


function renderProfile(){
    const nameEl = document.getElementById('profileName');
    const levelEl = document.getElementById('profileLevelLabel');
    const xpTextEl = document.getElementById('profileXPText');
    const xpBarEl = document.getElementById('profileXPBar');
    const powerEl = document.getElementById('profilePower');
    const specialEl = document.getElementById('profileSpecialList');
    const skillsEl = document.getElementById('profileSkillsList');
    const perksEl = document.getElementById('profilePerksList');
    const equipmentEl = document.getElementById('profileEquipmentList');
    const equipmentCountEl = document.getElementById('profileEquipmentCount');
    const inventoryEl = document.getElementById('profileInventorySummary');

    if (!nameEl && !specialEl && !skillsEl) return;

    const level = Number(state.character?.level) || 0;
    const xp = Number(state.character?.heroXP) || 0;
    const threshold = levelThreshold(level);
    const xpPct = threshold > 0 ? Math.min(100, (xp / threshold) * 100) : 0;

    if (nameEl) nameEl.textContent = state.character?.name || 'Без имени';
    if (levelEl) levelEl.textContent = `· УРОВЕНЬ ${level}`;
    if (xpTextEl) xpTextEl.textContent = `${fmt(xp)}/${fmt(threshold)}`;
    if (xpBarEl) xpBarEl.style.width = xpPct + '%';
    if (powerEl) animatePowerValue(powerEl, getProfilePower());
    renderProfilePowerBreakdown();

    if (specialEl) {
        specialEl.innerHTML = PROFILE_SPECIAL_ORDER.map(({letter, key}) => `
            <div class="profile-special-cell">
                <span class="profile-special-letter">${letter}</span>
                <b>${typeof getEffectiveSpecialValue === 'function' ? getEffectiveSpecialValue(key) : (Number(state.special?.[key]) || 0)}</b>
            </div>
        `).join('');
    }

    if (skillsEl) {
        const skills = Object.entries(state.skills || {});
        skillsEl.innerHTML = skills.length ? skills.map(([name, xpValue]) => {
            const skillXP = Number(xpValue) || 0;
            const skillLevel = typeof getEffectiveSkillLevel === 'function' ? getEffectiveSkillLevel(name) : getSkillLevel(skillXP);
            const parts = String(name).trim().split(/\s+/);
            const emoji = parts.shift() || '•';
            const skillName = parts.join(' ') || name;
            return `
                <div class="profile-skill-cell">
                    <span class="profile-skill-icon">${escapeHtml(emoji)}</span>
                    <span class="profile-skill-name">${escapeHtml(skillName)}</span>
                    <b class="profile-skill-level">${skillLevel}</b>
                </div>
            `;
        }).join('') : `<div class="empty">Навыков пока нет.</div>`;
    }

    if (perksEl) {
        const perks = state.perksUnlocked || [];
        perksEl.innerHTML = perks.length ? perks.map(perk => {
            const name = typeof perk === 'string' ? perk : perk.name;
            const effects = typeof perk === 'string' ? [] : (perk.effects || []);
            return `
                <div class="profile-perk-item">
                    <div class="profile-perk-name">🔓 ${escapeHtml(name || 'Без названия')}</div>
                    ${effects.map(effect => `<div class="sub">✨ ${escapeHtml(effect)}</div>`).join('')}
                </div>
            `;
        }).join('') : `<div class="empty">Пока нет разблокированных перков.</div>`;
    }

    const equipped = getProfileEquipmentItems();
    if (equipmentCountEl) equipmentCountEl.textContent = `${equipped.length} предметов экипировано`;
    if (equipmentEl) {
        equipmentEl.innerHTML = equipped.length ? equipped.map(({slot, item}) => `
            <div class="profile-equipment-item">
                <span class="profile-equipment-icon">${SLOT_ICON[slot] || '•'}</span>
                <div>
                    <b>${escapeHtml(item.name || 'Без названия')}</b>
                    <div class="sub">${escapeHtml(slot)}</div>
                </div>
                ${item.rarity ? `<span class="rarity ${item.rarity}">${escapeHtml(RARITY_LABEL[item.rarity] || item.rarity)}</span>` : ''}
            </div>
        `).join('') : `<div class="empty">Экипировка отсутствует.</div>`;
    }

    if (inventoryEl) {
        const total = getProfileInventoryCount();
        const stacks = (state.inventory || []).length;
        const materials = (state.inventory || []).filter(i => i.type === 'material').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        const consumables = (state.inventory || []).filter(i => i.type === 'consumable').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        const equipment = (state.inventory || []).filter(i => i.type === 'equipment').reduce((s, i) => s + (Number(i.qty) || 1), 0);
        inventoryEl.innerHTML = `
            <div class="profile-inventory-stat"><b>${fmt(total)}</b><span>Всего предметов</span></div>
            <div class="profile-inventory-stat"><b>${fmt(equipment)}</b><span>Снаряжение</span></div>
            <div class="profile-inventory-stat"><b>${fmt(consumables)}</b><span>Расходники</span></div>
            <div class="profile-inventory-stat"><b>${fmt(materials)}</b><span>Материалы</span></div>
        `;
    }
    renderProfileBuffs();
    renderProfileAdditional();
}

/* ===== js\settings.js ===== */
"use strict";

function applyTheme(themeId){
document.documentElement.setAttribute('data-theme', themeId === 'nature' ? '' : themeId);
}

function renderSettings(){
const soundToggle = document.getElementById('soundEnabledToggle');
if (soundToggle) {
  const on = state.settings.soundEnabled !== false;
  soundToggle.checked = on;
  soundToggle.setAttribute('aria-checked', on ? 'true' : 'false');
  const label = document.getElementById('soundEnabledLabel');
  if (label) label.textContent = on ? 'Включен' : 'Выключен';
}
const notifToggle = document.getElementById('notificationsEnabledToggle');
if (notifToggle) {
  const on = state.settings.notificationsEnabled !== false;
  notifToggle.checked = on;
  notifToggle.setAttribute('aria-checked', on ? 'true' : 'false');
  const label = document.getElementById('notificationsEnabledLabel');
  if (label) label.textContent = on ? 'Включены' : 'Выключены';
}
const grid = document.getElementById('themeGrid');
if (grid) {
grid.innerHTML = THEMES.map(t => `
<div class="theme-swatch ${state.settings.theme === t.id ? 'active' : ''}" data-theme-pick="${t.id}">
<div class="dots">${t.dots.map(c => `<span class="dot" style="background:${c}"></span>`).join('')}</div>
${t.label}
</div>
`).join('');
grid.querySelectorAll('[data-theme-pick]').forEach(el => el.addEventListener('click', () => {
const result = SettingsCore.setTheme(el.dataset.themePick);
if (!result.ok) return;
applyTheme(result.theme);
persist(); renderSettings();
}));
}

// --- AI hybrid UI ---
const themeSelect = document.getElementById('aiThemeSelect');
const themePickLabel = document.getElementById('aiThemePickLabel');
const themeDescription = document.getElementById('aiThemeDescription');
const theme = typeof getAITheme === 'function' ? getAITheme() : (state.settings.aiTheme || 'real_world');
if (themeSelect) themeSelect.value = theme;
if (themePickLabel) themePickLabel.textContent = AI_THEME_OPTIONS[theme] || AI_THEME_OPTIONS.real_world;
if (themeDescription) themeDescription.textContent = AI_THEME_DESCRIPTIONS[theme] || AI_THEME_DESCRIPTIONS.real_world;
const modeSelect = document.getElementById('aiModeSelect');
if (modeSelect) {
  modeSelect.value = state.settings?.aiMode === 'own_key' ? 'own_key' : 'free';
}
const modePickLabel = document.getElementById('aiModePickLabel');
if (modePickLabel) modePickLabel.textContent = modeSelect?.value === 'own_key' ? 'Свой ключ' : 'Бесплатный (10 / 24 ч)';
const modelSelect = document.getElementById('aiModelSelect');
if (modelSelect) modelSelect.value = typeof getAIModel === 'function' ? getAIModel() : 'deepseek-v4-flash';
const modelPickLabel = document.getElementById('aiModelPickLabel');
if (modelPickLabel) modelPickLabel.textContent = AI_MODEL_OPTIONS[modelSelect?.value] || AI_MODEL_OPTIONS['deepseek-v4-flash'];
const modelDescription = document.getElementById('aiModelDescription');
if (modelDescription) modelDescription.textContent = AI_MODEL_DESCRIPTIONS[modelSelect?.value] || AI_MODEL_DESCRIPTIONS['deepseek-v4-flash'];
const modelCostHint = document.getElementById('aiModelCostHint');
if (modelCostHint) modelCostHint.textContent = `Стоимость: ${AI_MODEL_COSTS[modelSelect?.value] || AI_MODEL_COSTS['deepseek-v4-flash']} от базовой стоимости токенов.`;
const ownKeyBlock = document.getElementById('aiOwnKeyBlock');
if (ownKeyBlock) {
  ownKeyBlock.style.display = (state.settings?.aiMode === 'own_key') ? 'block' : 'none';
}
const keyInput = document.getElementById('aiOwnKeyInput');
if (keyInput) {
  if (state.settings?.aiOwnKey) {
    keyInput.value = '';
    keyInput.placeholder = 'Ключ сохранён (введи новый, чтобы заменить)';
  } else {
    keyInput.placeholder = 'tc_live_...';
  }
}
if (typeof updateAIStatus === 'function') updateAIStatus();
}

function wireSettings(){
    const themeSelect = document.getElementById('aiThemeSelect');
    const themePickBtn = document.getElementById('aiThemePickBtn');
    const openPicker = (title, options, selectedValue, onSelect, showCost = false) => {
      const overlay = document.createElement('div');
      overlay.className = 'ai-settings-picker-overlay';
      overlay.setAttribute('role', 'presentation');

      const dialog = document.createElement('div');
      dialog.className = 'ai-settings-picker';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      const heading = document.createElement('h3');
      heading.textContent = title;
      dialog.appendChild(heading);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'ai-settings-picker-close';
      close.textContent = '×';
      close.setAttribute('aria-label', 'Закрыть');
      close.addEventListener('click', () => overlay.remove());
      dialog.appendChild(close);

      const list = document.createElement('div');
      list.className = 'ai-settings-picker-options';
      options.forEach(([value, label, description, cost]) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = `ai-settings-picker-option${value === selectedValue ? ' active' : ''}`;
        option.setAttribute('aria-pressed', value === selectedValue ? 'true' : 'false');

        const name = document.createElement('span');
        name.className = 'ai-settings-picker-name';
        name.textContent = label;
        option.appendChild(name);
        if (showCost && cost) {
          const price = document.createElement('span');
          price.className = 'ai-settings-picker-cost';
          price.textContent = cost;
          option.appendChild(price);
        }
        const detail = document.createElement('span');
        detail.className = 'ai-settings-picker-description';
        detail.textContent = description;
        option.appendChild(detail);
        option.addEventListener('click', () => {
          onSelect(value);
          overlay.remove();
        });
        list.appendChild(option);
      });
      dialog.appendChild(list);
      overlay.appendChild(dialog);
      overlay.addEventListener('click', event => {
        if (event.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
      close.focus();
    };
    const applyAITheme = (value) => {
      const result = SettingsCore.setAITheme(value);
      if (!result.ok) return false;
      persist();
      renderSettings();
      return true;
    };
    if (themeSelect && !themeSelect.dataset.wired) {
      themeSelect.dataset.wired = '1';
      themeSelect.value = typeof getAITheme === 'function' ? getAITheme() : 'real_world';
      themeSelect.addEventListener('change', () => {
        if (applyAITheme(themeSelect.value)) toast(`🎭 Атмосфера: ${AI_THEME_OPTIONS[themeSelect.value]}`);
      });
    }
    if (themePickBtn && !themePickBtn.dataset.wired) {
      themePickBtn.dataset.wired = '1';
      themePickBtn.addEventListener('click', () => {
        const current = typeof getAITheme === 'function' ? getAITheme() : 'real_world';
        const options = Object.entries(AI_THEME_OPTIONS).map(([value, label]) =>
          [value, label, AI_THEME_DESCRIPTIONS[value]]
        );
        openPicker('🎭 Атмосфера контента', options, current, value => {
          themeSelect.value = value;
          themeSelect.dispatchEvent(new Event('change'));
        });
      });
    }

    const soundToggle = document.getElementById('soundEnabledToggle');
    if (soundToggle && !soundToggle.dataset.wired) {
      soundToggle.dataset.wired = '1';
      soundToggle.addEventListener('change', () => {
        const on = !!soundToggle.checked;
        const result = SettingsCore.setSoundEnabled(on);
        if (!result.ok) return;
        persist();
        if (typeof Sound !== 'undefined') {
          if (on) Sound.play('toggleOn');
          else Sound.play('toggleOff');
        }
        renderSettings();
        toast(on ? '🔊 Звук включен' : '🔇 Звук выключен');
      });
    }
    const notifToggle = document.getElementById('notificationsEnabledToggle');
    if (notifToggle && !notifToggle.dataset.wired) {
      notifToggle.dataset.wired = '1';
      notifToggle.addEventListener('change', async () => {
        const on = !!notifToggle.checked;
        const result = SettingsCore.setNotificationsEnabled(on);
        if (!result.ok) return;
        persist();
        if (!on && typeof Notifications !== 'undefined') {
          await Notifications.cancelRaid();
        }
        if (on && typeof Notifications !== 'undefined') {
          const granted = await Notifications.requestPermission();
          if (!granted) toast('⚠️ Разреши уведомления в системе Android');
          else toast('🔔 Уведомления включены');
        } else {
          toast(on ? '🔔 Уведомления включены' : '🔕 Уведомления выключены');
        }
        renderSettings();
      });
    }

    // --- AI Mode ---
    const modeSelect = document.getElementById('aiModeSelect');
    if (modeSelect && !modeSelect.dataset.wired) {
      modeSelect.dataset.wired = '1';
      modeSelect.value = state.settings?.aiMode === 'own_key' ? 'own_key' : 'free';
      modeSelect.addEventListener('change', () => {
        const result = SettingsCore.setAIMode(modeSelect.value);
        if (!result.ok) return;
        persist();
        renderSettings();
        if (typeof updateAIStatus === 'function') updateAIStatus();
        const modePickLabel = document.getElementById('aiModePickLabel');
        if (modePickLabel) modePickLabel.textContent = modeSelect.value === 'own_key' ? 'Свой ключ' : 'Бесплатный (10 / 24 ч)';
        toast(modeSelect.value === 'own_key' ? '🔑 Режим: свой ключ' : '🎁 Режим: бесплатный лимит');
      });
    }
    const modePickBtn = document.getElementById('aiModePickBtn');
    if (modePickBtn && !modePickBtn.dataset.wired) {
      modePickBtn.dataset.wired = '1';
      modePickBtn.addEventListener('click', () => {
        if (!modeSelect) return;
        modeSelect.value = modeSelect.value === 'own_key' ? 'free' : 'own_key';
        modeSelect.dispatchEvent(new Event('change'));
      });
    }

    const saveKeyBtn = document.getElementById('aiOwnKeySaveBtn');
    if (saveKeyBtn && !saveKeyBtn.dataset.wired) {
      saveKeyBtn.dataset.wired = '1';
      saveKeyBtn.addEventListener('click', () => {
        const val = (document.getElementById('aiOwnKeyInput')?.value || '').trim();
        const result = SettingsCore.setAIOwnKey(val);
        if (!result.ok) return;
        persist();
        if (typeof updateAIStatus === 'function') updateAIStatus();
        renderSettings();
        toast(result.hasKey ? '✅ Ключ сохранён локально' : 'Ключ очищен');
      });
    }

    const clearKeyBtn = document.getElementById('aiOwnKeyClearBtn');
    if (clearKeyBtn && !clearKeyBtn.dataset.wired) {
      clearKeyBtn.dataset.wired = '1';
      clearKeyBtn.addEventListener('click', () => {
        SettingsCore.clearAIOwnKey();
        const input = document.getElementById('aiOwnKeyInput');
        if (input) {
          input.value = '';
          input.placeholder = 'tc_live_...';
        }
        persist();
        if (typeof updateAIStatus === 'function') updateAIStatus();
        renderSettings();
        toast('🔑 Ключ удалён');
      });
    }

    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect) {
      providerSelect.value = 'tooken';
      if (!providerSelect.dataset.wired) {
        providerSelect.dataset.wired = '1';
        providerSelect.addEventListener('change', () => {
          if (typeof setAIProvider === 'function') setAIProvider(providerSelect.value);
          const modelSelect = document.getElementById('aiModelSelect');
          if (modelSelect && typeof getAIModel === 'function') modelSelect.value = getAIModel();
          toast(`🤖 Провайдер: ${AI_PROVIDER_OPTIONS?.[getAIProvider?.()] || providerSelect.value}`);
        });
      }
    }
    const modelSelect = document.getElementById('aiModelSelect');
    if (modelSelect) {
      modelSelect.value = typeof getAIModel === 'function' ? getAIModel() : 'deepseek-v4-flash-0731';
      if (!modelSelect.dataset.wired) {
        modelSelect.dataset.wired = '1';
        modelSelect.addEventListener('change', () => {
          if (typeof setAIModel === 'function' && !setAIModel(modelSelect.value)) {
            renderSettings();
            return;
          }
          renderSettings();
          toast(`🤖 Модель: ${typeof getAIModelLabel === 'function' ? getAIModelLabel() : modelSelect.value}`);
        });
      }
    }
    const modelPickBtn = document.getElementById('aiModelPickBtn');
    if (modelPickBtn && modelSelect && !modelPickBtn.dataset.wired) {
      modelPickBtn.dataset.wired = '1';
      modelPickBtn.addEventListener('click', () => {
        const current = typeof getAIModel === 'function' ? getAIModel() : modelSelect.value;
        const options = Object.entries(AI_MODEL_OPTIONS).map(([value, label]) =>
          [value, label, AI_MODEL_DESCRIPTIONS[value], AI_MODEL_COSTS[value]]
        );
        openPicker('🧠 Выбор модели', options, current, value => {
          modelSelect.value = value;
          modelSelect.dispatchEvent(new Event('change'));
        }, true);
      });
    }
  }

/* ===== js\sound.js ===== */
"use strict";

/* Sound — Web Audio SFX (no external files). Offline-safe. */

const Sound = (() => {
  let ctx = null;
  let master = null;
  let unlocked = false;

  function enabled() {
    try {
      if (typeof state !== "undefined" && state && state.settings && state.settings.soundEnabled === false) return false;
    } catch (_) {}
    return true;
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 3.96; // ~18× vs first ship (0.22); ×2 vs v3.6.8
    master.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }
    unlocked = true;
  }

  function tone({ freq = 440, type = "sine", start = 0, dur = 0.12, peak = 0.12, attack = 0.01, release = null }) {
    const c = ensureCtx();
    if (!c || !master || !enabled()) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    const rel = release != null ? release : Math.max(0.02, dur * 0.55);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + 0.01, dur));
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  function chord(freqs, opts = {}) {
    freqs.forEach((f, i) => {
      tone({
        freq: f,
        type: opts.type || "sine",
        start: (opts.stagger || 0) * i,
        dur: opts.dur || 0.28,
        peak: (opts.peak || 0.055) * (1 - i * 0.08),
        attack: opts.attack || 0.02
      });
    });
  }

  const SFX = {
    ui() {
      tone({ freq: 720, type: "triangle", dur: 0.06, peak: 0.035, attack: 0.005 });
    },
    tab() {
      tone({ freq: 520, type: "triangle", dur: 0.07, peak: 0.04, attack: 0.008 });
      tone({ freq: 780, type: "sine", start: 0.03, dur: 0.05, peak: 0.025, attack: 0.005 });
    },
    success() {
      tone({ freq: 523.25, type: "sine", dur: 0.12, peak: 0.06 });
      tone({ freq: 659.25, type: "sine", start: 0.09, dur: 0.16, peak: 0.055 });
      tone({ freq: 783.99, type: "triangle", start: 0.18, dur: 0.2, peak: 0.045 });
    },
    fail() {
      tone({ freq: 320, type: "sawtooth", dur: 0.14, peak: 0.03, attack: 0.01 });
      tone({ freq: 220, type: "triangle", start: 0.1, dur: 0.22, peak: 0.04 });
    },
    levelup() {
      chord([261.63, 329.63, 392.0, 523.25], { stagger: 0.1, dur: 0.36, peak: 0.07, type: "triangle" });
      tone({ freq: 659.25, type: "sine", start: 0.42, dur: 0.35, peak: 0.05 });
    },
    achievement(isMaxRank) {
      if (isMaxRank) {
        chord([261.63, 329.63, 392.0, 523.25, 659.25], { stagger: 0.11, dur: 0.38, peak: 0.07, type: "triangle" });
      } else {
        chord([392.0, 493.88, 587.33], { stagger: 0.1, dur: 0.3, peak: 0.055, type: "sine" });
      }
    },
    raidStart() {
      tone({ freq: 110, type: "square", dur: 0.18, peak: 0.03, attack: 0.02 });
      tone({ freq: 165, type: "triangle", start: 0.12, dur: 0.22, peak: 0.04 });
      tone({ freq: 220, type: "sine", start: 0.28, dur: 0.28, peak: 0.035 });
    },
    raidWarn() {
      tone({ freq: 440, type: "square", dur: 0.1, peak: 0.04 });
      tone({ freq: 440, type: "square", start: 0.16, dur: 0.1, peak: 0.035 });
    },
    quest() {
      SFX.success();
    },
    equip() {
      tone({ freq: 880, type: "triangle", dur: 0.08, peak: 0.04, attack: 0.005 });
      tone({ freq: 1320, type: "sine", start: 0.05, dur: 0.12, peak: 0.03 });
    },
    consumable() {
      tone({ freq: 600, type: "sine", dur: 0.1, peak: 0.04 });
      tone({ freq: 900, type: "triangle", start: 0.08, dur: 0.14, peak: 0.035 });
    },
    boss() {
      chord([196.0, 246.94, 293.66, 392.0], { stagger: 0.12, dur: 0.4, peak: 0.06, type: "triangle" });
    },
    toggleOn() {
      tone({ freq: 480, type: "sine", dur: 0.08, peak: 0.05 });
      tone({ freq: 720, type: "sine", start: 0.07, dur: 0.1, peak: 0.04 });
    },
    toggleOff() {
      tone({ freq: 400, type: "triangle", dur: 0.1, peak: 0.035 });
    },
    boot() {
      // CRT power-on + reticle lock
      tone({ freq: 80, type: "sawtooth", dur: 0.22, peak: 0.08, attack: 0.03 });
      tone({ freq: 160, type: "square", start: 0.12, dur: 0.16, peak: 0.05 });
      tone({ freq: 330, type: "triangle", start: 0.28, dur: 0.18, peak: 0.06 });
      tone({ freq: 523.25, type: "sine", start: 0.48, dur: 0.22, peak: 0.07 });
      tone({ freq: 659.25, type: "sine", start: 0.62, dur: 0.28, peak: 0.055 });
      tone({ freq: 784, type: "triangle", start: 0.9, dur: 0.35, peak: 0.04 });
    }
  };

  function play(name, arg) {
    if (!enabled() && name !== "toggleOn") return;
    unlock();
    const fn = SFX[name];
    if (typeof fn === "function") {
      try { fn(arg); } catch (_) {}
    }
  }

  function installUnlockListeners() {
    const once = () => {
      unlock();
      document.removeEventListener("pointerdown", once, true);
      document.removeEventListener("touchstart", once, true);
      document.removeEventListener("keydown", once, true);
    };
    document.addEventListener("pointerdown", once, true);
    document.addEventListener("touchstart", once, true);
    document.addEventListener("keydown", once, true);
  }

  return {
    play,
    unlock,
    enabled,
    installUnlockListeners,
    // named helpers
    ui: () => play("ui"),
    tab: () => play("tab"),
    success: () => play("success"),
    fail: () => play("fail"),
    levelup: () => play("levelup"),
    achievement: (max) => play("achievement", max),
    raidStart: () => play("raidStart"),
    raidWarn: () => play("raidWarn"),
    quest: () => play("quest"),
    equip: () => play("equip"),
    consumable: () => play("consumable"),
    boss: () => play("boss"),
    boot: () => play("boot")
  };
})();

if (typeof window !== "undefined") {
  window.Sound = Sound;
}

/* ===== js\notifications.js ===== */
"use strict";

/* Local notifications — raid timer end (Capacitor LocalNotifications + web fallback). */

const Notifications = (() => {
  const RAID_ID = 71001;
  let permissionAsked = false;

  function enabled() {
    try {
      if (typeof state !== "undefined" && state && state.settings && state.settings.notificationsEnabled === false) {
        return false;
      }
    } catch (_) {}
    return true;
  }

  function plugin() {
    try {
      const cap = window.Capacitor;
      const p = cap && cap.Plugins && cap.Plugins.LocalNotifications;
      return p || null;
    } catch (_) {
      return null;
    }
  }

  function isNative() {
    try {
      return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
    } catch (_) {
      return false;
    }
  }

  async function requestPermission() {
    if (!enabled()) return false;
    const ln = plugin();
    if (ln && typeof ln.requestPermissions === "function") {
      try {
        const res = await ln.requestPermissions();
        permissionAsked = true;
        const display = res && (res.display || res.receive);
        return display === "granted" || display === "prompt";
      } catch (_) {
        return false;
      }
    }
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        const res = await Notification.requestPermission();
        permissionAsked = true;
        return res === "granted";
      } catch (_) {
        return false;
      }
    }
    if (typeof Notification !== "undefined") return Notification.permission === "granted";
    return false;
  }

  async function ensurePermission() {
    if (!enabled()) return false;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return true;
    const ln = plugin();
    if (ln && typeof ln.checkPermissions === "function") {
      try {
        const res = await ln.checkPermissions();
        const display = res && (res.display || res.receive);
        if (display === "granted") return true;
      } catch (_) {}
    }
    return requestPermission();
  }

  async function cancelRaid() {
    const ln = plugin();
    if (ln && typeof ln.cancel === "function") {
      try {
        await ln.cancel({ notifications: [{ id: RAID_ID }] });
      } catch (_) {}
    }
  }

  async function scheduleRaidEnd(raidTitle, endAtMs) {
    if (!enabled()) return { ok: false, reason: "disabled" };
    const when = Number(endAtMs);
    if (!Number.isFinite(when) || when <= Date.now() + 1500) {
      return { ok: false, reason: "too_soon" };
    }
    await cancelRaid();
    const okPerm = await ensurePermission();
    if (!okPerm && isNative()) return { ok: false, reason: "denied" };

    const title = "⚔️ Рейд: время вышло";
    const body = raidTitle
      ? `«${String(raidTitle).replace(/[«»]/g, "")}» — подтверди: Выполнить или Провалить`
      : "Подтверди результат рейда: Выполнить или Провалить";

    const ln = plugin();
    if (ln && typeof ln.schedule === "function") {
      try {
        // Channel (Android 8+)
        if (typeof ln.createChannel === "function") {
          try {
            await ln.createChannel({
              id: "raid",
              name: "Рейды",
              description: "Окончание таймера рейда",
              importance: 5,
              visibility: 1,
              sound: "default",
              vibration: true
            });
          } catch (_) {}
        }
        await ln.schedule({
          notifications: [{
            id: RAID_ID,
            title,
            body,
            channelId: "raid",
            schedule: { at: new Date(when), allowWhileIdle: true },
            extra: { type: "raid-expired" },
            iconColor: "#00ffaa"
          }]
        });
        return { ok: true, native: true };
      } catch (e) {
        console.warn("[Notifications] schedule failed", e);
      }
    }

    // Web Notification API cannot schedule for the future reliably when the page is closed.
    // Best-effort: if the tab is open near the deadline, updateRaidTimer still fires in-app.
    return { ok: false, reason: "no_native_scheduler" };
  }

  function wireActionOpenQuests() {
    const ln = plugin();
    if (!ln || typeof ln.addListener !== "function") return;
    try {
      ln.addListener("localNotificationActionPerformed", (event) => {
        try {
          const extra = event && event.notification && event.notification.extra;
          if (extra && extra.type === "raid-expired" && typeof switchTab === "function") {
            switchTab("quests");
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  async function init() {
    wireActionOpenQuests();
    if (!enabled()) return;
    // Soft permission ask only on native after first launch interaction is better;
    // still prepare channel early when possible.
    const ln = plugin();
    if (ln && typeof ln.createChannel === "function") {
      try {
        await ln.createChannel({
          id: "raid",
          name: "Рейды",
          description: "Окончание таймера рейда",
          importance: 5,
          visibility: 1
        });
      } catch (_) {}
    }
  }

  return {
    RAID_ID,
    enabled,
    init,
    requestPermission,
    ensurePermission,
    scheduleRaidEnd,
    cancelRaid
  };
})();

if (typeof window !== "undefined") window.Notifications = Notifications;

/* ===== js\boot.js ===== */
"use strict";

/* Boot splash — dense/fast terminal sequence */

const BootSplash = (() => {
  let finished = false;
  let sequenceTimer = null;
  let resolveRun = null;

  // ~3× more lines than v3.7.3 (9 → 27)
  const LINES = [
    { t: "> TCoL kernel entry 0x7C00 …", cls: "is-dim" },
    { t: "> POST memcheck  … 128M ok", cls: "is-ok" },
    { t: "> irq table remap … ok", cls: "is-ok" },
    { t: "> fs://localStorage mount … ok", cls: "is-ok" },
    { t: "> fs://indexedDB mount … ok", cls: "is-ok" },
    { t: "> native Preferences bridge … probe", cls: "is-dim" },
    { t: "> save envelope schema v2 … checksum", cls: "is-ok" },
    { t: "> migration chain … idle", cls: "is-dim" },
    { t: "> safety backup slot … ready", cls: "is-ok" },
    { t: "> GameState root … bind", cls: "is-ok" },
    { t: "> character profile … load", cls: "is-ok" },
    { t: "> SPECIAL/skills/perks … hydrate", cls: "is-ok" },
    { t: "> quest runtime … online", cls: "is-ok" },
    { t: "> raid timer service … standby", cls: "is-dim" },
    { t: "> boss registry … indexed", cls: "is-ok" },
    { t: "> inventory/equipment mesh … ok", cls: "is-ok" },
    { t: "> craft pipeline … ok", cls: "is-ok" },
    { t: "> economy ticks … armed", cls: "is-ok" },
    { t: "> achievement bus … listen", cls: "is-ok" },
    { t: "> journal writer … open", cls: "is-ok" },
    { t: "> AudioContext link … ready", cls: "is-ok" },
    { t: "> LocalNotifications channel … raid", cls: "is-dim" },
    { t: "> UI shell / bottom-nav … calibrated", cls: "is-ok" },
    { t: "> theme tokens … phosphor", cls: "is-ok" },
    { t: "> offline cache … available", cls: "is-ok" },
    { t: "> AI gateway … deferred", cls: "is-dim" },
    { t: "> watchdog … green", cls: "is-ok" }
  ];

  function el(id){ return document.getElementById(id); }

  function playBootSound() {
    try {
      if (typeof Sound !== "undefined") {
        Sound.unlock();
        Sound.boot();
      }
    } catch (_) {}
  }

  function appendLine(text, cls) {
    const log = el("bootTerminalLog");
    if (!log) return null;
    log.querySelectorAll(".boot-log-cursor").forEach((n) => n.classList.remove("boot-log-cursor"));
    const line = document.createElement("div");
    line.className = "boot-log-line" + (cls ? " " + cls : "") + " boot-log-cursor";
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    return line;
  }

  function typeTitle(done) {
    const out = el("bootTcolOut");
    if (!out) { done(); return; }
    out.innerHTML = "";
    const text = "The Creed of Life";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "boot-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = (i * 0.035) + "s";
      out.appendChild(span);
    });
    setTimeout(done, 35 * text.length + 650);
  }

  function hide() {
    if (finished) return;
    finished = true;
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    const splash = el("bootSplash");
    if (!splash) {
      if (resolveRun) resolveRun();
      return;
    }
    splash.classList.add("is-done");
    splash.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      try { splash.remove(); } catch (_) {}
      if (resolveRun) resolveRun();
    }, 520);
  }

  function runSequence() {
    const log = el("bootTerminalLog");
    if (!log) {
      hide();
      return;
    }
    let i = 0;
    // 3× faster than 320ms → ~107ms
    const stepMs = 107;

    function next() {
      if (finished) return;
      if (i < LINES.length) {
        appendLine(LINES[i].t, LINES[i].cls);
        i += 1;
        sequenceTimer = setTimeout(next, stepMs);
        return;
      }
      const finale = el("bootTerminalFinale");
      if (finale) finale.hidden = false;
      log.querySelectorAll(".boot-log-cursor").forEach((n) => n.classList.remove("boot-log-cursor"));
      try { if (typeof Sound !== "undefined") Sound.success(); } catch (_) {}
      sequenceTimer = setTimeout(() => {
        typeTitle(() => {
          sequenceTimer = setTimeout(hide, 600);
        });
      }, 200);
    }
    next();
  }

  function run() {
    const splash = el("bootSplash");
    if (!splash) return Promise.resolve();
    finished = false;
    playBootSound();
    const once = () => {
      playBootSound();
      document.removeEventListener("pointerdown", once, true);
      document.removeEventListener("touchstart", once, true);
    };
    document.addEventListener("pointerdown", once, true);
    document.addEventListener("touchstart", once, true);

    return new Promise((resolve) => {
      resolveRun = resolve;
      sequenceTimer = setTimeout(runSequence, 120);
      setTimeout(() => {
        if (!finished) hide();
      }, 10000);
    });
  }

  function done() {}
  function setProgress(){}

  return { run, done, hide, setProgress };
})();

if (typeof window !== "undefined") window.BootSplash = BootSplash;

/* ===== js\app.js ===== */
"use strict";

function toast(msg){
const existing = document.querySelector('.toast');
if (existing) existing.remove();
const el = document.createElement("div");
el.className = "toast";
el.textContent = msg;
document.body.appendChild(el);
setTimeout(()=> el.remove(), 2600);
}

function toastAIError(error, prefix){
if (error && error.cancelled) return;
toast((prefix || '❌ Ошибка генерации: ') + error.message);
console.error(error);
}

let achievementUnlockQueue = [];
let achievementUnlockActive = false;
let achievementUnlockSequenceBlocked = false;

function beginRewardSequence(){
    achievementUnlockSequenceBlocked = true;
}

function releaseRewardSequence(){
    achievementUnlockSequenceBlocked = false;
    if (!achievementUnlockActive) showNextAchievementUnlock();
}

function queueAchievementUnlock(data){
    achievementUnlockQueue.push(data);
    if (!achievementUnlockSequenceBlocked && !achievementUnlockActive) showNextAchievementUnlock();
}

function playAchievementSound(isMaxRank = false){
    if (typeof Sound !== 'undefined') Sound.achievement(!!isMaxRank);
}

function showNextAchievementUnlock(){
    if (achievementUnlockActive || !achievementUnlockQueue.length) return;
    achievementUnlockActive = true;
    const data = achievementUnlockQueue.shift();
    const overlay = document.createElement('div');
    overlay.className = `achievement-unlock-overlay${data.isMaxRank ? ' achievement-unlock-max' : ''}`;

    const particles = document.createElement('div');
    particles.className = 'achievement-particles';
    for (let i = 0; i < 18; i++) {
        const particle = document.createElement('span');
        particle.style.setProperty('--particle-angle', `${Math.round((360 / 18) * i)}deg`);
        particle.style.setProperty('--particle-delay', `${(i % 6) * 0.025}s`);
        particles.appendChild(particle);
    }

    const card = document.createElement('div');
    card.className = 'achievement-unlock-card';
    const transition = data.previousRank
        ? `<div class="achievement-unlock-rank-transition"><span>${escapeHtml(data.previousRank)}</span><b>→</b><strong>${escapeHtml(data.rank)}</strong></div>`
        : `<div class="achievement-unlock-rank">РАНГ ${escapeHtml(data.rank)}</div>`;
    const footer = data.isMaxRank ? 'МАКСИМАЛЬНЫЙ РАНГ ДОСТИГНУТ' : (data.previousRank ? 'РАНГ ПОВЫШЕН' : 'НОВОЕ ДОСТИЖЕНИЕ');
    const progressText = data.currentValueText
        ? `${escapeHtml(data.currentValueText)}${data.unit ? ` ${escapeHtml(data.unit)}` : ''}`
        : 'Получено';
    const nextText = data.isMaxRank
        ? 'Достигнут максимальный X ранг'
        : data.nextThresholdText
            ? `Следующий ранг: ${escapeHtml(data.nextThresholdText)}${data.unit ? ` ${escapeHtml(data.unit)}` : ''}`
            : 'Персональное достижение';
    card.innerHTML = `
        <div class="achievement-unlock-icon-wrap"><div class="achievement-unlock-icon">${escapeHtml(data.icon || '🏆')}</div></div>
        <div class="achievement-unlock-new">
            <div class="achievement-unlock-label">НОВОЕ ДОСТИЖЕНИЕ</div>
            <div class="achievement-unlock-title">${escapeHtml(data.title || 'Новое достижение')}</div>
        </div>
        <div class="achievement-unlock-desc">${escapeHtml(data.desc || 'Достижение открыто в профиле.')}</div>
        ${transition}
        <div class="achievement-unlock-progress">
            <div class="achievement-unlock-progress-label">Прогресс</div>
            <div class="achievement-unlock-progress-value">${progressText}</div>
            <div class="achievement-unlock-next">${nextText}</div>
        </div>
        <div class="achievement-unlock-footer">${footer === 'НОВОЕ ДОСТИЖЕНИЕ' ? 'ДОСТИЖЕНИЕ ПОЛУЧЕНО' : footer}</div>
        <div class="achievement-unlock-hint">Нажмите, чтобы закрыть</div>
    `;
    overlay.appendChild(particles);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    playAchievementSound(data.isMaxRank);

    let closing = false;
    let animationDone = false;
    let hintTimer = null;
    const markAnimationDone = () => {
        if (animationDone || closing || !overlay.isConnected) return;
        animationDone = true;
        const hint = card.querySelector('.achievement-unlock-hint');
        if (hint) hint.textContent = 'Нажмите, чтобы закрыть';
    };
    // Ждём завершения самой длинной анимации (кольцо у максимального ранга: 1.35s + delay).
    // Раньше таймер был 1.05s, поэтому визуально анимация ещё шла, а логика уже считала её завершённой.
    hintTimer = setTimeout(markAnimationDone, 1650);

    const finish = () => {
        if (closing || !overlay.isConnected) return;
        if (!animationDone) {
            animationDone = true;
            overlay.classList.add('achievement-unlock-skip');
            const hint = card.querySelector('.achievement-unlock-hint');
            if (hint) hint.textContent = 'Нажмите, чтобы закрыть';
            return;
        }
        closing = true;
        if (hintTimer) clearTimeout(hintTimer);
        overlay.classList.add('achievement-unlock-closing');
        setTimeout(() => {
            if (overlay.isConnected) overlay.remove();
            achievementUnlockActive = false;
            showNextAchievementUnlock();
        }, 420);
    };
    overlay.addEventListener('click', finish);
}

let activityTrackingTimer = null;
let activityTrackingLast = null;

function formatActivityDuration(totalSeconds){
const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
if (hours > 0) return `${hours} ч ${minutes} мин`;
return `${minutes} мин`;
}

function flushActivityTime(force = false){
if (!state) return;
const now = Date.now();
if (activityTrackingLast === null) { activityTrackingLast = now; return; }
if (document.visibilityState !== 'visible' && !force) { activityTrackingLast = now; return; }
const elapsed = Math.max(0, Math.min(60, Math.floor((now - activityTrackingLast) / 1000)));
if (elapsed <= 0) return;
activityTrackingLast = now;
resetTodayStatsIfNeeded();
if (typeof CharacterCore !== 'undefined') CharacterCore.addActivitySeconds(elapsed); else return;
stateDirty = true;
renderTodayStats();
}

function startActivityTracking(){
if (activityTrackingTimer) clearInterval(activityTrackingTimer);
activityTrackingLast = Date.now();
activityTrackingTimer = setInterval(() => flushActivityTime(false), 1000);
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible') {
activityTrackingLast = Date.now();
renderTodayStats();
} else {
flushActivityTime(true);
}
});
window.addEventListener('beforeunload', () => flushActivityTime(true));
}

function showAIThinking(text){
aiCancelRequested = false;
const el = document.getElementById('aiThinkingOverlay');
const txt = document.getElementById('aiThinkingText');
const timerEl = document.getElementById('aiThinkingTimer');
if (txt) txt.textContent = text || '🤖 AI думает...';
if (timerEl) timerEl.textContent = '0 сек';
if (el) el.style.display = 'flex';
aiThinkingStartTime = Date.now();
if (aiThinkingIntervalId) clearInterval(aiThinkingIntervalId);
aiThinkingIntervalId = setInterval(() => {
if (!timerEl) return;
const sec = Math.floor((Date.now() - aiThinkingStartTime) / 1000);
timerEl.textContent = sec + ' сек';
}, 1000);
}

function hideAIThinking(){
const el = document.getElementById('aiThinkingOverlay');
if (el) el.style.display = 'none';
if (aiThinkingIntervalId) { clearInterval(aiThinkingIntervalId); aiThinkingIntervalId = null; }
}

function wireAIThinkingCancel(){
const btn = document.getElementById('aiThinkingCancelBtn');
if (!btn) return;
btn.addEventListener('click', () => {
aiCancelRequested = true;
if (aiActiveController) {
try { aiActiveController.abort(); } catch {}
}
hideAIThinking();
toast('⏹ Генерация отменена');
});
}

async function withAIThinking(text, fn){
showAIThinking(text);
try {
return await fn();
} finally {
hideAIThinking();
}
}

function showConfirm(title, message, onConfirm) {
  const existing = document.querySelector('.confirm-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = `
  <div class="confirm-box">
  <h3>${escapeHtml(title)}</h3>
  <p>${escapeHtml(message)}</p>
  <div class="actions">
  <button class="btn" id="confirmCancel">Отмена</button>
  <button class="btn danger" id="confirmOk">Подтвердить</button>
  </div>
  </div>
  `;
document.body.appendChild(overlay);
overlay.querySelector('#confirmCancel').addEventListener('click', () => {
overlay.remove();
});
overlay.querySelector('#confirmOk').addEventListener('click', () => {
overlay.remove();
onConfirm();
});
overlay.addEventListener('click', (e) => {
if (e.target === overlay) overlay.remove();
});
}

const NAV_GROUPS = [
  { id: "game", icon: "⚔️", label: "Игра", tabs: ["char", "quests", "boss", "journal", "ach"] },
  { id: "character", icon: "🧍", label: "Персонаж", tabs: ["profile", "skills", "perks", "gear"] },
  { id: "resources", icon: "🎒", label: "Ресурсы", tabs: ["inventory", "craft", "economy"] },
  { id: "settings", icon: "⚙️", label: "Настройки", tabs: ["settings", "settings-ai"] }
];

function groupIdForTab(tabId) {
  const g = NAV_GROUPS.find(group => group.tabs.includes(tabId));
  return g ? g.id : null;
}

function renderTabs(){
    const nav = document.getElementById("tabs");
    if (!nav) return;
    nav.innerHTML = "";

    const tabById = Object.fromEntries(TABS.map(t => [t.id, t]));

    const makeSubButton = (t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t.label;
      b.dataset.tab = t.id;
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchTab(t.id);
        closeTabMenu();
      });
      return b;
    };

    NAV_GROUPS.forEach(group => {
      const wrap = document.createElement("div");
      wrap.className = "tab-group tab-group-collapsible";
      wrap.dataset.group = group.id;
      if (group.direct) wrap.classList.add("tab-group-direct");

      const primary = document.createElement("button");
      primary.className = "tab-primary";
      primary.type = "button";
      primary.dataset.group = group.id;
      primary.setAttribute("aria-expanded", "false");
      if (group.direct) {
        primary.setAttribute("aria-label", "Настройки");
        primary.title = "Настройки";
        primary.innerHTML = `<span class="tab-primary-icon">${group.icon}</span>`;
        primary.classList.add("tab-primary-icon-only");
      } else {
        primary.innerHTML = `<span class="tab-primary-icon">${group.icon}</span><span class="tab-primary-label">${group.label}</span>`;
      }

      primary.addEventListener("click", (e) => {
        e.preventDefault();
        if (group.direct) {
          closeTabMenu();
          switchTab(group.tabs[0]);
          return;
        }

        const isOpen = wrap.classList.contains("open");
        closeTabMenu();
        if (!isOpen) {
          wrap.classList.remove("closing");
          wrap.classList.add("open");
          primary.setAttribute("aria-expanded", "true");
          document.getElementById("tabMenuBackdrop")?.classList.add("visible");
        }
      });

      wrap.appendChild(primary);

      if (!group.direct) {
        const subnav = document.createElement("div");
        subnav.className = "tab-subnav";
        subnav.setAttribute("role", "menu");
        group.tabs.forEach(id => {
          if (tabById[id]) subnav.appendChild(makeSubButton(tabById[id]));
        });
        wrap.appendChild(subnav);
      }

      nav.appendChild(wrap);
    });

    // Backdrop: tap outside closes sub-menu
    let backdrop = document.getElementById("tabMenuBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "tabMenuBackdrop";
      backdrop.className = "tab-menu-backdrop";
      backdrop.addEventListener("click", () => closeTabMenu());
      document.body.appendChild(backdrop);
    }

    // Highlight current tab if panels already active
    const activePanel = document.querySelector("section.panel.active");
    if (activePanel && activePanel.id.startsWith("panel-")) {
      switchTab(activePanel.id.slice(6));
    } else {
      switchTab("char");
    }
}

function closeTabMenu(){
  document.querySelectorAll(".tab-group-collapsible").forEach(g => {
    const p = g.querySelector(".tab-primary");
    if (p) p.setAttribute("aria-expanded", "false");
    g.classList.remove("closing");
    if (g.classList.contains("open")) {
      g.classList.remove("open");
      g.classList.add("closing");
      setTimeout(() => g.classList.remove("closing"), 160);
    }
  });
  document.getElementById("tabMenuBackdrop")?.classList.remove("visible");
}

function switchTab(id){
  if (typeof Sound !== 'undefined') Sound.tab();
  document.querySelectorAll(".tab-subnav button").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === id);
  });
  const targetId = "panel-" + id;
  document.querySelectorAll("section.panel").forEach(p => {
    const on = p.id === targetId;
    if (on) {
      if (!p.classList.contains("active")) {
        p.classList.add("active");
        p.classList.remove("panel-enter");
        void p.offsetWidth;
        p.classList.add("panel-enter");
      } else {
        p.classList.add("active");
      }
    } else {
      p.classList.remove("active", "panel-enter");
    }
  });

  const groupId = groupIdForTab(id);
  document.querySelectorAll(".tab-group-collapsible").forEach(g => {
    g.classList.toggle("active-group", g.dataset.group === groupId);
  });

  // Show backdrop only while a sub-menu is open
  const open = document.querySelector(".tab-group-collapsible.open");
  document.getElementById("tabMenuBackdrop")?.classList.toggle("visible", !!open);

  try {
    const panel = document.getElementById("panel-" + id);
    if (panel) panel.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  } catch (_) {}
}

function updateDateTime() {
const now = new Date();
const options = {
day: '2-digit', month: '2-digit', year: 'numeric',
hour: '2-digit', minute: '2-digit', second: '2-digit'
};
const el = document.getElementById('datetimeDisplay');
if (el) el.textContent = '🕐 ' + now.toLocaleString('ru-RU', options);
}

function scheduleRaidNotification() {
  if (typeof Notifications === 'undefined') return;
  if (!state.raidActive || !state.raidStartTime) return;
  const totalMs = Math.max(0, Number(state.raidTotalMinutes || 0) * 60000);
  if (totalMs <= 0) return;
  const endAt = Number(state.raidStartTime) + totalMs;
  const raid = (state.quests.active || []).find(q => q && q.type === 'рейд');
  const title = raid ? raid.title : '';
  Notifications.scheduleRaidEnd(title, endAt).catch(() => {});
}

function clearRaidNotification() {
  if (typeof Notifications === 'undefined') return;
  Notifications.cancelRaid().catch(() => {});
}

function startRaidTimer() {
if (raidTimerInterval) {
clearInterval(raidTimerInterval);
raidTimerInterval = null;
}
if (state.raidActive && state.raidStartTime) {
raidTimerInterval = setInterval(() => {
updateRaidTimer();
}, 1000);
updateRaidTimer();
scheduleRaidNotification();
} else {
const el = document.getElementById('raidTimer');
if (el) el.textContent = '';
clearRaidNotification();
}
}

function updateRaidTimer() {
const el = document.getElementById('raidTimer');
if (!el) return;
if (!state.raidActive || !state.raidStartTime) {
el.textContent = '';
return;
}
const elapsedMs = Date.now() - state.raidStartTime;
const totalMs = Math.max(0, Number(state.raidTotalMinutes || 0) * 60000);
if (totalMs > 0 && elapsedMs >= totalMs) {
  // Time is up — do NOT auto-fail. Player must confirm success or failure.
  el.textContent = '⏰ ВРЕМЯ ВЫШЛО — подтверди результат';
  el.classList.add('raid-timer-expired');
  if (!state._raidExpiredNotified) {
    state._raidExpiredNotified = true;
    clearRaidNotification();
    // Re-render once so action buttons switch to Выполнить / Провалить
    try { if (typeof renderQuests === 'function') renderQuests(); } catch (_) {}
    if (typeof Sound !== 'undefined') Sound.raidWarn();
    toast('⏰ Время рейда истекло. Подтверди: Выполнить или Провалить');
  }
  return;
}
el.classList.remove('raid-timer-expired');
state._raidExpiredNotified = false;
const remainingMs = Math.max(0, totalMs - elapsedMs);
const totalSeconds = Math.ceil(remainingMs / 1000);
const hours = Math.floor(totalSeconds / 3600);
const minutes = Math.floor((totalSeconds % 3600) / 60);
const seconds = totalSeconds % 60;
let msg = `⏳ Осталось ${hours}ч ${String(minutes).padStart(2,'0')}м ${String(seconds).padStart(2,'0')}с`;
if (totalMs > 0) {
  const pct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  msg += ` · ${pct}%`;
}
el.textContent = msg;
}

function renderHeader(){
    const elName = document.getElementById("charName");
    const elLevel = document.getElementById("charLevel");
    const elXpBar = document.getElementById("xpBar");
    const elXpText = document.getElementById("xpText");
    const elCoins = document.getElementById("coinsTop");
    const elSpecialPoints = document.getElementById("specialPointsTop");
    const elHeaderPower = document.getElementById("headerPowerValue");
    if (elName) elName.textContent = state.character.name;
    if (elLevel) elLevel.textContent = "УРОВЕНЬ " + state.character.level;
    const threshold = levelThreshold(state.character.level);
    const pct = Math.min(100, (state.character.heroXP/threshold*100));
    if (elXpBar) elXpBar.style.width = pct + "%";
    if (elXpText) elXpText.textContent = `${state.character.heroXP}/${threshold}`;
    if (elCoins) elCoins.textContent = fmt(state.character.coins);
    if (elSpecialPoints) elSpecialPoints.textContent = state.character.specialPoints;
    if (elHeaderPower) animatePowerValue(elHeaderPower, getProfilePower());
    if (pendingLevelUpEffect) {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.remove('level-up-pulse');
            void header.offsetWidth;
            header.classList.add('level-up-pulse');
            setTimeout(() => header.classList.remove('level-up-pulse'), 700);
        }
        pendingLevelUpEffect = false;
    }
    updateDateTime();
    updateActiveBuffsHeader();
}

function renderTodayStats(){
resetTodayStatsIfNeeded();
const elQuests = document.getElementById("todayQuests");
const elCoins = document.getElementById("todayCoins");
const elXP = document.getElementById("todayXP");
const elActivity = document.getElementById("todayActivity");
if (elQuests) elQuests.textContent = state.todayStats.quests;
if (elCoins) elCoins.textContent = state.todayStats.coins;
if (elXP) elXP.textContent = state.todayStats.xp;
if (elActivity) elActivity.textContent = formatActivityDuration(state.todayStats.activitySeconds);
}

function dashQuestHtml(q){
    const dm = diffMeta(q.difficulty);
    let timeHtml = '';
    if (q.estMinutes) {
        const hours = Math.floor(q.estMinutes / 60);
        const minutes = q.estMinutes % 60;
        timeHtml = `<span class="pill time">⏱ ${hours}ч ${minutes}м</span>`;
    }
    const diffKey = safeDifficulty(q.difficulty);
    return `
    <div class="quest diff-${diffKey}">
        <div class="qh"><span class="title">${escapeHtml(q.icon||'')} ${escapeHtml(q.title)}</span><span class="qid">#${formatQuestId(q.id)}</span></div>
        <div class="pill-row">
            <span class="pill diff-${diffKey}">${dm.label}</span>
            ${timeHtml}
            ${q.reward && q.reward.heroXP ? `<span class="pill reward-hero">⭐ +${q.reward.heroXP} XP</span>` : ''}
            ${q.reward && q.reward.coins ? `<span class="pill reward-coin">🪙 +${q.reward.coins}</span>` : ''}
        </div>
    </div>
    `;
}

function renderDashboard(){
const bossWrap = document.getElementById('dashBoss');
if (bossWrap){
const boss = getActiveBoss();
if (!boss){
bossWrap.innerHTML = `<div class="empty">Нет активного босса</div>`;
} else {
const isFinancial = boss.bossType !== 'other';
const unit = boss.unit || (isFinancial ? '₽' : 'ед.');
const totalProgress = boss.phases.reduce((s,p) => s + Math.min(p.progress,p.target), 0);
const remaining = Math.max(0, boss.target - totalProgress);
const barPct = Math.min(100, isFinancial ? (remaining / boss.target * 100) : (totalProgress / boss.target * 100));
const barGradient = isFinancial ? 'linear-gradient(90deg,var(--red),#ff8a3d)' : 'linear-gradient(90deg,#ff8a3d,var(--gold))';
bossWrap.innerHTML = `
<div style="color:var(--phosphor-bright); font-weight:700; font-size:13px;">${escapeHtml(boss.name)}</div>
<div class="sub">${escapeHtml(boss.goal)}</div>
<div class="xp-row" style="margin-top:6px;">
<div class="bar boss-bar"><span style="width:${barPct}%; background:${barGradient};"></span></div>
<span>${barPct.toFixed(1)}%</span>
</div>
<div class="sub" style="margin-top:2px;">${isFinancial ? `HP босса: ${fmt(remaining)} / ${fmt(boss.target)} ${unit}` : `Прогресс: ${fmt(totalProgress)} / ${fmt(boss.target)} ${unit}`}</div>
`;
}
}
const raidWrap = document.getElementById('dashRaid');
if (raidWrap){
const raid = state.quests.active.find(q => q.type === 'рейд');
raidWrap.innerHTML = raid ? dashQuestHtml(raid) : `<div class="empty">Нет активного рейда</div>`;
}
const plannedWrap = document.getElementById('dashPlanned');
if (plannedWrap){
plannedWrap.innerHTML = state.quests.planned.length
? state.quests.planned.map(q => dashQuestHtml(q)).join('')
: `<div class="empty">Нет запланированного квеста</div>`;
}
const activeWrap = document.getElementById('dashActive');
if (activeWrap){
const activeQuests = state.quests.active.filter(q => q.type !== 'рейд');
activeWrap.innerHTML = activeQuests.length
? activeQuests.map(q => dashQuestHtml(q)).join('')
: `<div class="empty">Нет активного квеста</div>`;
}
}

function escapeHtml(value){
const str=String(value??'');
return str.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function showFirstLaunchNicknameForm(){
  const overlay = document.getElementById('firstLaunchOverlay');
  const input = document.getElementById('firstLaunchNickname');
  const error = document.getElementById('firstLaunchError');
  const button = document.getElementById('firstLaunchStartBtn');
  if (!overlay || !input || !button) return;

  overlay.style.display = 'flex';
  document.body.classList.add('first-launch-open');
  input.value = '';
  if (error) error.textContent = '';

  const submit = () => {
    const nickname = input.value.trim();
    if (!nickname) {
      if (error) error.textContent = 'Введите никнейм.';
      input.focus();
      return;
    }

    if (nickname.length > 24) {
      if (error) error.textContent = 'Никнейм должен содержать не более 24 символов.';
      input.focus();
      return;
    }

    const nameResult = typeof CharacterCore !== 'undefined' ? CharacterCore.setName(nickname) : {ok:false};
    if (!nameResult.ok) {
      if (error) error.textContent = 'Не удалось изменить имя профиля.';
      return;
    }
    if (!SaveService.save()) {
      if (error) error.textContent = 'Не удалось сохранить профиль. Попробуйте ещё раз.';
      return;
    }

    overlay.style.display = 'none';
    document.body.classList.remove('first-launch-open');
    renderHeader();
    renderProfile();
    toast(`Добро пожаловать, ${nickname}!`);
  };

  button.onclick = submit;
  input.onkeydown = (event) => {
    if (event.key === 'Enter') submit();
  };

  setTimeout(() => input.focus(), 50);
}

// ===== Skills UI (must be before renderAll/init) =====
const SPECIAL_ORDER = [
    { letter: 'S', key: '💪 Сила' },
    { letter: 'P', key: '👁️ Восприятие' },
    { letter: 'E', key: '🛡️ Выносливость' },
    { letter: 'C', key: '🗣️ Харизма' },
    { letter: 'I', key: '🧠 Интеллект' },
    { letter: 'A', key: '⚡ Ловкость' },
    { letter: 'L', key: '🎲 Удача' },
];

function renderSpecial(){
    const grid = document.getElementById("specialGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const canSpend = state.character.specialPoints > 0;
    SPECIAL_ORDER.forEach(({letter, key})=>{
        if (!(key in state.special)) return;
        const v = state.special[key];
        const div = document.createElement("div");
        div.className = "special-cell";
        div.innerHTML = `<span class="sp-name"><b class="sp-letter">${letter}</b> — ${key}</span><b class="sp-value">${v}</b><button class="btn primary sp-plus" data-special="${key}" style="font-size:10px;" ${canSpend ? '' : 'disabled'}>+1</button>`;
        grid.appendChild(div);
    });
    grid.querySelectorAll('.sp-plus').forEach(btn => btn.addEventListener('click', () => {
        const key = btn.dataset.special;
        if (state.character.specialPoints <= 0) return;
        const result = typeof CharacterCore !== 'undefined' ? CharacterCore.spendSpecialPoint(key) : {ok:false};
        if (!result.ok) return;
        persist(); renderAll();
        const newBlock = Array.from(document.querySelectorAll('.special-cell')).find(cell =>
            cell.querySelector('.sp-plus')?.dataset.special === key
        );
        spawnBoostEffect(newBlock);
        toast(`${key} повышена до ${result.value}`);
    }));
}

function renderSkills(){
    const list = document.getElementById("skillsList");
    if (!list) return;
    list.innerHTML = "";

    const groups = [
        { letter: 'S', key: '💪 Сила' },
        { letter: 'P', key: '👁️ Восприятие' },
        { letter: 'E', key: '🛡️ Выносливость' },
        { letter: 'C', key: '🗣️ Харизма' },
        { letter: 'I', key: '🧠 Интеллект' },
        { letter: 'A', key: '⚡ Ловкость' },
        { letter: 'L', key: '🎲 Удача' },
    ];

    const skillsByName = new Map(SKILLS_DATA.map(skill => [skill.name, skill]));
    const rendered = new Set();

    const renderSkillRow = (skill) => {
        const name = skill.name;
        const xp = Number(state.skills[name]) || 0;
        const level = getSkillLevel(xp);
        const specialKey = getSkillSpecial(name);
        const multiplier = getSkillMultiplier(name);
        const nextThreshold = skillLevelThreshold(level + 1);
        const currentThreshold = skillLevelFloor(level);
        const xpInLevel = Math.max(0, xp - currentThreshold);
        const xpNeeded = Math.max(1, nextThreshold - currentThreshold);
        const pct = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

        rendered.add(name);

        return `
            <div class="skill-row skill-group-row">
                <div class="label skill-row-head">
                    <span class="skill-row-title">
                        <span class="skill-name">${escapeHtml(name)}</span>
                        <span class="skill-total-xp">${fmt(xp)} XP</span>
                    </span>
                    <b class="skill-level-right">УРОВЕНЬ ${level}</b>
                </div>
                <div class="bar"><span style="width:${pct}%"></span></div>
                <div class="skill-row-meta">
                    <span>${fmt(xpInLevel)} / ${fmt(xpNeeded)} XP до уровня ${level + 1}</span>
                    <span>${specialKey ? `${escapeHtml(formatSkillMultiplier(multiplier))} XP` : ''}</span>
                </div>
            </div>
        `;
    };

    groups.forEach(({letter, key}) => {
        const skills = SPECIAL_SKILL_LINKS[key] || [];
        const block = document.createElement('div');
        block.className = 'skill-special-block';
        block.innerHTML = `
            <div class="skill-special-header">
                <span class="skill-special-letter">${letter}</span>
                <span class="skill-special-name">${escapeHtml(key)}</span>
            </div>
            <div class="skill-special-list">
                ${skills.map(name => {
                    const skill = skillsByName.get(name) || {name, desc:''};
                    return renderSkillRow(skill);
                }).join('')}
            </div>
        `;
        list.appendChild(block);
    });

    // Если в данных появится новый навык, не привязанный к SPECIAL,
    // не теряем его из интерфейса.
    const ungrouped = SKILLS_DATA.filter(skill => !rendered.has(skill.name));
    if (ungrouped.length) {
        const block = document.createElement('div');
        block.className = 'skill-special-block skill-special-block-ungrouped';
        block.innerHTML = `
            <div class="skill-special-header">
                <span class="skill-special-letter">•</span>
                <span class="skill-special-name">ПРОЧИЕ НАВЫКИ</span>
            </div>
            <div class="skill-special-list">${ungrouped.map(renderSkillRow).join('')}</div>
        `;
        list.appendChild(block);
    }
}

function renderAll(){
renderHeader();
renderTodayStats();
renderDashboard();
renderSpecial();
renderPerks();
renderSkills();
renderQuests();
renderBosses();
renderEconomy();
renderSlots();
renderAccessorySlots();
renderInventory();
renderCraft();
renderAchievements();
renderProfile();
renderJournal();
renderSettings();
updateAIStatus();
}

function hasInitializedProfile(){
  return !!(state && state.character && typeof state.character.name === 'string' && state.character.name.trim());
}

async function init(){
  // Show CRT boot + logo before wiring the rest
  let bootPromise = Promise.resolve();
  if (typeof BootSplash !== 'undefined') {
    bootPromise = BootSplash.run();
  }
const hasSavedGame = await SaveService.loadAsync();
if (!hasSavedGame) {
  GameState.replace(defaultState());
}
const profileInitialized = hasInitializedProfile();
applyTheme(state.settings.theme || 'nature');

// Сначала запускаем сам интерфейс. AI не должен блокировать вкладки и кнопки.
try { renderTabs(); } catch (e) { console.error('renderTabs failed:', e); }
try { renderAll(); } catch (e) { console.error('renderAll failed:', e); toast('⚠️ Ошибка отрисовки интерфейса: ' + e.message); }
if (typeof initEnumPickers === 'function') {
  try { initEnumPickers(); } catch (e) { console.error('initEnumPickers failed:', e); }
}
if (!profileInitialized) showFirstLaunchNicknameForm();
startActivityTracking();

// Проверка AI — полностью неблокирующая, не задерживает интерфейс.
checkAIAvailability().catch(e => console.error('AI check failed:', e));

const wireSteps = [
  ['wireNewQuestForm', wireNewQuestForm],
  ['wireBossCreation', wireBossCreation],
  ['wireShopCreation', wireShopCreation],
  ['wireShopAI', wireShopAI],
  ['wireInventoryFilters', wireInventoryFilters],
  ['wireGearCreation', wireGearCreation],
  ['wireAIPerkGeneration', wireAIPerkGeneration],
  ['wireCraft', wireCraft],
  ['wireJournal', wireJournal],
  ['wireSettings', wireSettings],
  ['wireExportImport', wireExportImport],
  ['wireSaveIndicator', wireSaveIndicator],
  ['wireAI', wireAI],
  ['wireAIThinkingCancel', wireAIThinkingCancel]
];
wireSteps.forEach(([name, fn]) => {
  try { fn(); } catch (e) { console.error(name + ' failed:', e); }
});
setInterval(updateDateTime, 1000);
setInterval(updateActiveBuffsHeader, 1000);
setInterval(() => {
autosaveNextAt = Date.now() + AUTOSAVE_INTERVAL;
if (stateDirty) SaveService.save();
}, AUTOSAVE_INTERVAL);
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'hidden') {
flushActivityTime(true);
flushPendingSave(false);
} else {
updateActiveBuffsHeader();
}
});
window.addEventListener('beforeunload', () => {
flushActivityTime(true);
flushPendingSave(false);
});
if (state.raidActive) {
startRaidTimer();
}
if (typeof Sound !== 'undefined' && Sound.installUnlockListeners) Sound.installUnlockListeners();
if (typeof Notifications !== 'undefined' && Notifications.init) {
  try { Notifications.init(); } catch (e) { console.warn('Notifications.init failed', e); }
}
if (state.raidActive) scheduleRaidNotification();
console.log('🧬 The Creed of Life v3.7.4 (Fast terminal boot) + AI loaded');
console.log(`📊 Level ${state.character.level}, ${state.quests.active.length} active quests`);
console.log(`👹 ${state.bosses.length} bosses`);
console.log(`🤖 AI: ${aiAvailable ? 'online' : 'offline'}`);
  try {
    if (typeof BootSplash !== 'undefined') BootSplash.done();
    await bootPromise;
  } catch (_) {}
}

// Запускаем приложение после загрузки DOM.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
