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
