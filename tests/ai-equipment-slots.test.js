'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const context = {
  console,
  Math,
  Number,
  String,
  Object,
  Array,
  Set,
  Promise,
  Date,
  state: {
    character: { level: 3 },
    settings: { aiTheme: 'real_world' }
  },
  SPECIAL_SKILL_LINKS: {},
  SKILL_NAMES: [],
  document: { getElementById() { return null; } },
  persist() {},
  updateAIStatus() {},
  aiAvailable: true,
  toast() {},
  toastAIError() {},
  withAIThinking(_message, callback) { return callback(); }
};
vm.createContext(context);
for (const file of ['data/constants.js', 'data/rarities.js', 'js/ai.js', 'js/equipment.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
vm.runInContext(
  'this.__generateEquipmentWithAI = generateEquipmentWithAI; ' +
  'this.__normalizeCraftRecipes = normalizeCraftRecipes; ' +
  'this.__generateCraftRecipesWithAI = generateCraftRecipesWithAI;',
  context
);

function mockQueryAI(responses) {
  const prompts = [];
  context.__aiResponses = responses;
  context.__aiPrompts = prompts;
  context.__aiCalls = 0;
  vm.runInContext(`queryAI = async (prompt, systemPrompt) => {
    __aiPrompts.push({ prompt, systemPrompt });
    return __aiResponses[__aiCalls++];
  };`, context);
  return { prompts, get calls() { return context.__aiCalls; } };
}

(async () => {
  let ai = mockQueryAI([{ name:'🕶️ Защитный визор', desc:'Прозрачный визор для работы', slot:'Голова' }]);
  const relevantFaceItem = await context.__generateEquipmentWithAI('мастерская', 'Лицо');
  assert.strictEqual(ai.calls, 1, 'relevant face equipment must need one AI request');
  assert.strictEqual(relevantFaceItem.slot, 'Лицо', 'accepted face equipment must keep the selected slot');
  assert.match(ai.prompts[0].systemPrompt, /ТОЛЬКО очки, солнцезащитные очки, маски, визоры, балаклавы, защитные щитки/);

  ai = mockQueryAI([
    { name:'🪖 Шлем с визором', desc:'Защита головы', slot:'Лицо' },
    { name:'😷 Маска от пыли', desc:'Защищает лицо при уборке', slot:'Лицо' }
  ]);
  const retriedFaceItem = await context.__generateEquipmentWithAI('уборка', 'Лицо');
  assert.strictEqual(ai.calls, 2, 'irrelevant face equipment must receive exactly one retry');
  assert.strictEqual(retriedFaceItem.name, '😷 Маска от пыли');
  assert.strictEqual(retriedFaceItem.slot, 'Лицо');

  ai = mockQueryAI([
    { name:'🪖 Шлем курьера', desc:'Защита головы', slot:'Лицо' },
    { name:'🎧 Наушники', desc:'Для прослушивания музыки', slot:'Лицо' }
  ]);
  await assert.rejects(context.__generateEquipmentWithAI('дорога', 'Лицо'), /подходящий предмет для слота «Лицо»/);
  assert.strictEqual(ai.calls, 2, 'face equipment must stop after one retry');

  ai = mockQueryAI([{ name:'🪖 Шлем курьера', desc:'Защита головы', slot:'Голова' }]);
  const headItem = await context.__generateEquipmentWithAI('дорога', 'Голова');
  assert.strictEqual(ai.calls, 1, 'other slots must not use face retry policy');
  assert.strictEqual(headItem.slot, 'Голова');

  const materials = [{ name:'Ткань', qty:3 }, { name:'Нитки', qty:2 }];
  const recipes = context.__normalizeCraftRecipes([{
    name:'🧥 Плащ дождевик', type:'equipment', category:'Плащ', slot:'Тело верхняя',
    materials:[{ name:'Ткань', qty:2 }, { name:'Нитки', qty:1 }], rarity:'common',
    condition:'good', effect:'+1 к 🧘 Концентрация', desc:'Защита от дождя'
  }], materials);
  assert.strictEqual(recipes[0].slot, 'Верхняя одежда', 'cloak recipes must use the canonical outerwear slot');

  ai = mockQueryAI([{
    name:'🧥 Плащ дождевик', type:'equipment', category:'Плащ', slot:'Верхняя одежда',
    materials:[{ name:'Ткань', qty:2 }, { name:'Нитки', qty:1 }], rarity:'common',
    condition:'good', effect:'+1 к 🧘 Концентрация', desc:'Защита от дождя'
  }]);
  await context.__generateCraftRecipesWithAI(materials);
  assert.match(ai.prompts[0].systemPrompt, /Плащ→Верхняя одежда/);
  assert.doesNotMatch(ai.prompts[0].systemPrompt, /Тело верхняя/);

  console.log('ai-equipment-slots: PASS');
})().catch(error => { console.error(error); process.exitCode = 1; });
