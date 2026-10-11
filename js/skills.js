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
