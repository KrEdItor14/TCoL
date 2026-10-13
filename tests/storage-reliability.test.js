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
  base.settings = { aiTheme:"dark_fantasy", aiModel:"glm-5.3-flash" };
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

  console.log("storage-reliability: PASS");
})().catch(err => { console.error(err); process.exitCode = 1; });
