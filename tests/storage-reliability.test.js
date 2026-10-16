"use strict";
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
}

const localStorage = new MemoryStorage();
const context = {
  console,
  Date,
  Math,
  JSON,
  Number,
  String,
  Object,
  Array,
  Promise,
  TextEncoder,
  setTimeout,
  clearTimeout,
  STORAGE_KEY: "tcol-save",
  QUEST_COMPLETED_MAX: 200,
  RAID_MAX_MINUTES: 1440,
  SLOT_MAP_OLD_TO_NEW: {
    "Голова": "Голова",
    "Лицо": "Лицо",
    "Торс": "Тело",
    "Туловище": "Тело",
    "Тело": "Тело",
    "Тело верхняя": "Верхняя одежда",
    "Верхняя одежда": "Верхняя одежда",
    "Перчатки": "Перчатки",
    "Ноги": "Ноги",
    "Ступни": "Ступни",
    "Обувь": "Обувь",
    "Рюкзак": "Рюкзак"
  },
  ACCESSORY_SLOTS: ["Запястье (левое)", "Запястье (правое)", "Пальцы", "Шея", "Гаджет"],
  EQUIPMENT_POWER_BY_RARITY: { common: 5 },
  EQUIPMENT_CONDITION_MULTIPLIER: { good: 1 },
  EQUIPMENT_CONDITION_ALIASES: { good: "good" },
  RARITY_ORDER: ["common"],
  isAccessorySlot: slot => ["Запястье (левое)", "Запястье (правое)", "Пальцы", "Шея", "Гаджет"].includes(slot),
  normalizeConsumableDuration: value => Number(value) || 30,
  rollConsumableRarity: () => "common",
  APP_VERSION: "3.6.0",
  AI_THEME_OPTIONS: {
    real_world: "Реальный мир",
    fantasy: "Фэнтези",
    sci_fi: "Научная фантастика",
    post_apocalyptic: "Постапокалипсис"
  },
  AI_MODEL_OPTIONS: {
    "deepseek-v4.1-flash": "DeepSeek V4.1 Flash",
    "deepseek-v4-flash": "DeepSeek V4 Pro",
    "glm-5.3-flash": "GLM 5.3 Flash",
    "gpt-6-luna": "GPT-6 Luna",
    "gpt-6-astra": "GPT-6 Astra"
  },
  window: { localStorage },
  DESC_XP_CAP: 45,
  DESC_XP_PER_CHAR: 0.12,
  XP_PER_MINUTE: 0.22,
  COIN_RATIO: 0.55,
  SKILL_POOL_RATIO: 0.65,
  document: { getElementById: () => null },
  toast: () => {},
  renderAll: () => {},
  defaultState: () => ({ character:{level:1,name:"Test"}, skills:{}, quests:{planned:[],active:[],completed:[],stats:{completed:0,failed:0,aborted:0}}, journal:[], coinLog:[] }),
  createAchievementState: () => [],
  syncLegacyEffects: () => {},
  state: null,
  stateDirty: false,
  autosaveTimeout: null,
  autosaveNextAt: Date.now(),
  AUTOSAVE_INTERVAL: 60000,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/state.js", "utf8"), context, { filename:"js/state.js" });
vm.runInContext(fs.readFileSync("js/game-state.js", "utf8"), context, { filename:"js/game-state.js" });
vm.runInContext(fs.readFileSync("js/storage.js", "utf8"), context, { filename:"js/storage.js" });
vm.runInContext(fs.readFileSync("js/save.js", "utf8"), context, { filename:"js/save.js" });
vm.runInContext(fs.readFileSync("js/quest-core.js", "utf8"), context, { filename:"js/quest-core.js" });
vm.runInContext("this.__GameState = GameState; this.__StorageService = StorageService; this.__SaveService = SaveService; this.__QuestCore = QuestCore;", context);

const GameState = context.__GameState;
const StorageService = context.__StorageService;
const SaveService = context.__SaveService;
const QuestCore = context.__QuestCore;

(async () => {
  const base = context.defaultState();
  base.settings = {
    aiTheme:"dark_fantasy",
    aiModel:"glm-5.3-flash",
    aiMode:"free",
    aiFreeUsed:4,
    aiFreeWindowStart:Date.now(),
    aiDailyFreeLimit:10
  };
  base.quests.completed = Array.from({length: 350}, (_, i) => ({id:i}));
  base.journal = Array.from({length: 700}, (_, i) => ({ts: Date.now() - i * 1000, text:"x"}));
  base.coinLog = Array.from({length: 100}, (_, i) => ({delta:i}));
  GameState.initialize(base);

  const envelope = context.createSaveEnvelope(base);
  assert.strictEqual(envelope.version, 2);
  assert.ok(envelope.state.quests.completed.length <= 200);
  assert.ok(envelope.state.journal.length <= 500);
  assert.ok(envelope.state.coinLog.length <= 40);
  assert.ok(envelope.checksum);
  const restoredSettings = context.migrateSavePayload(envelope).settings;
  assert.strictEqual(restoredSettings.aiTheme, "fantasy");
  assert.strictEqual(restoredSettings.aiModel, "glm-5.3-flash");
  assert.strictEqual(Object.hasOwn(restoredSettings, "aiMode"), false);
  assert.strictEqual(Object.hasOwn(restoredSettings, "aiFreeUsed"), false);

  const tampered = JSON.parse(JSON.stringify(envelope));
  tampered.state.character.level = 99;
  assert.throws(() => context.parseSavePayload(tampered), /повреждён|изменён/);

  assert.strictEqual(await context.createSafetyBackupAsync("test"), true);
  assert.strictEqual(StorageService.exists("tcol-save-safety"), true);
  assert.strictEqual(context.hasSafetyBackup(), true);

  GameState.replace({ character:{level:9,name:"Changed"}, skills:{}, quests:{planned:[],active:[],completed:[],stats:{completed:0,failed:0,aborted:0}}, journal:[], coinLog:[] });
  assert.strictEqual(await context.restoreSafetyBackup(), true);
  assert.strictEqual(GameState.get().character.level, 1);

  const migrated = context.defaultState();
  migrated.quests = {
    planned: [{ type:"рейд", id:8, total:4, progress:2 }],
    active: [{ type:"обычный", id:12, total:3, progress:1 }, { type:"обычный", title:"Missing ID" }],
    completed: [{ id:15, total:7, progress:6 }],
    stats: { completed:0, failed:0, aborted:0 }
  };
  migrated.nextQuestId = 3;
  context.migrateState(migrated, { legacyAchievements:false });
  assert.strictEqual(migrated.nextQuestId, 17);
  assert.deepStrictEqual(
    [migrated.quests.planned[0].id, migrated.quests.active[0].id, migrated.quests.active[1].id, migrated.quests.completed[0].id],
    [8, 12, 16, 15]
  );
  [migrated.quests.planned[0], ...migrated.quests.active, ...migrated.quests.completed].forEach(q => {
    assert.strictEqual("total" in q, false);
    assert.strictEqual("progress" in q, false);
  });

  const allocationState = context.defaultState();
  allocationState.nextQuestId = 20;
  GameState.replace(allocationState);
  const plannedRaid = QuestCore.createQuest({ type:"рейд", id:900, total:5, progress:2, estMinutes:30 });
  const activeQuest = QuestCore.startNewQuest({ type:"обычный", id:900, total:3, progress:1 });
  assert.strictEqual(plannedRaid.quest.id, 20);
  assert.strictEqual(activeQuest.quest.id, 21);
  assert.strictEqual(QuestCore.startPlannedQuest(0).id, 20);
  assert.strictEqual(allocationState.nextQuestId, 22);
  assert.strictEqual(context.formatQuestId(1), "001");
  assert.strictEqual(context.formatQuestId(1000), "1000");
  assert.strictEqual(QuestCore.advanceStep, undefined);
  assert.strictEqual(context.computeQuestReward("normal", 30, [], "").heroXP, 85);

  const roundTrip = context.migrateSavePayload(context.createSaveEnvelope(allocationState));
  assert.strictEqual(roundTrip.nextQuestId, 22);
  assert.deepStrictEqual(
    [roundTrip.quests.active[0].id, roundTrip.quests.active[1].id],
    [21, 20]
  );

  const legacySlotState = context.defaultState();
  legacySlotState.equipment = {
    "Тело верхняя": {
      name: "Старый плащ",
      desc: "Наследный предмет",
      rarity: "common",
      condition: "good",
      effect: "+1 к защите"
    }
  };
  legacySlotState.inventory = [{
    id: "legacy-coat",
    type: "equipment",
    name: "Запасной плащ",
    desc: "Для дождя",
    rarity: "common",
    condition: "good",
    effect: "+1 к комфорту",
    slot: "Тело верхняя",
    qty: 2
  }];
  context.migrateState(legacySlotState, { legacyAchievements:false });
  assert.strictEqual(legacySlotState.equipment["Верхняя одежда"].name, "Старый плащ");
  assert.strictEqual(legacySlotState.equipment["Верхняя одежда"].slot, "Верхняя одежда");
  assert.strictEqual(Object.hasOwn(legacySlotState.equipment, "Тело верхняя"), false);
  assert.deepStrictEqual(legacySlotState.inventory.find(item => item.id === "legacy-coat"), {
    id: "legacy-coat",
    type: "equipment",
    name: "Запасной плащ",
    desc: "Для дождя",
    rarity: "common",
    condition: "good",
    effect: "+1 к комфорту",
    slot: "Верхняя одежда",
    qty: 2,
    itemLevel: 1,
    power: 5
  });

  const conflictSlotState = context.defaultState();
  conflictSlotState.equipment = {
    "Верхняя одежда": { name:"Каноническая куртка", rarity:"common", condition:"good", effect:"", slot:"Верхняя одежда" },
    "Тело верхняя": { name:"Старый плащ", rarity:"common", condition:"good", effect:"", slot:"Тело верхняя" }
  };
  context.migrateState(conflictSlotState, { legacyAchievements:false });
  assert.strictEqual(conflictSlotState.equipment["Верхняя одежда"].name, "Каноническая куртка");
  assert.strictEqual(conflictSlotState.inventory.filter(item => item.name === "Старый плащ").length, 1);
  assert.strictEqual(conflictSlotState.inventory.find(item => item.name === "Старый плащ").slot, "Верхняя одежда");
  context.migrateState(conflictSlotState, { legacyAchievements:false });
  assert.strictEqual(conflictSlotState.equipment["Верхняя одежда"].name, "Каноническая куртка");
  assert.strictEqual(conflictSlotState.inventory.filter(item => item.name === "Старый плащ").length, 1,
    "repeated slot migration must not duplicate the legacy item");
  assert.strictEqual(Object.hasOwn(conflictSlotState.equipment, "Тело верхняя"), false,
    "repeated slot migration must not restore the legacy slot");

  const legacyEnvelopeState = context.defaultState();
  legacyEnvelopeState.equipment = {
    "Тело верхняя": { name:"Плащ из v2", rarity:"common", condition:"good", effect:"" }
  };
  const legacyEnvelope = context.createSaveEnvelope(legacyEnvelopeState);
  const migratedEnvelope = context.migrateSavePayload(legacyEnvelope);
  assert.strictEqual(migratedEnvelope.equipment["Верхняя одежда"].name, "Плащ из v2");
  assert.strictEqual(Object.hasOwn(migratedEnvelope.equipment, "Тело верхняя"), false);

  console.log("storage-reliability: PASS");
})().catch(err => { console.error(err); process.exitCode = 1; });
