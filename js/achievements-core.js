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
