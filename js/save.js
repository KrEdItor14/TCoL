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
