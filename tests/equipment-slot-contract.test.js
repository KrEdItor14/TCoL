'use strict';

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const expectedEquipSlots = [
  'Голова', 'Лицо', 'Тело', 'Верхняя одежда',
  'Перчатки', 'Ноги', 'Ступни', 'Обувь', 'Рюкзак'
];

const context = {
  console,
  Math,
  Object,
  Array,
  Set,
  createAchievementState: () => []
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('data/constants.js', 'utf8'), context, {
  filename: 'data/constants.js'
});
vm.runInContext(fs.readFileSync('data/default-state.js', 'utf8'), context, {
  filename: 'data/default-state.js'
});

const equipSlots = vm.runInContext('EQUIP_SLOTS', context);
const accessorySlots = vm.runInContext('ACCESSORY_SLOTS', context);
const allSlots = vm.runInContext('ALL_SLOTS', context);
const slotIcons = vm.runInContext('SLOT_ICON', context);
const equipment = vm.runInContext('defaultState().equipment', context);

assert.deepStrictEqual([...equipSlots], expectedEquipSlots,
  'exclusive equipment slots must keep their canonical order');
assert.strictEqual(new Set(equipSlots).size, expectedEquipSlots.length,
  'exclusive equipment slots must not contain duplicates');
assert.deepStrictEqual([...Object.keys(equipment)], expectedEquipSlots,
  'default equipment state must use exactly the exclusive slot contract');
assert.ok(Object.values(equipment).every(item => item === null),
  'default equipment slots must start empty');
assert.deepStrictEqual([...allSlots], [...expectedEquipSlots, ...accessorySlots],
  'all slots must append accessories after exclusive equipment slots');
assert.ok(expectedEquipSlots.every(slot => !accessorySlots.includes(slot)),
  'exclusive equipment slots must not be accessories');
assert.ok(allSlots.every(slot => typeof slotIcons[slot] === 'string' && slotIcons[slot]),
  'every slot must have an icon');

const pickerElements = new Map();
const capturedConfigs = [];
pickerElements.set('gearNewSlotPicker', {
  appendChild() {}
});
context.document = {
  getElementById(id) {
    return pickerElements.get(id) || null;
  }
};
context.EnumPicker = {
  create(config) {
    capturedConfigs.push(config);
    return { container: {} };
  }
};
vm.runInContext(fs.readFileSync('js/init-pickers.js', 'utf8'), context, {
  filename: 'js/init-pickers.js'
});
vm.runInContext('initEnumPickers()', context);

assert.strictEqual(capturedConfigs.length, 1,
  'slot picker must be configured when its container is available');
const slotPicker = capturedConfigs[0];
assert.deepStrictEqual([...slotPicker.groups[0].items], expectedEquipSlots,
  'slot picker exclusive group must use the canonical equipment list');
assert.deepStrictEqual([...slotPicker.options.map(option => option.value)], [...allSlots],
  'slot picker options must use the canonical all-slots list');
assert.strictEqual(slotPicker.defaultValue, expectedEquipSlots[0],
  'slot picker default must be the first exclusive slot');

const generatedRuntimeFiles = [
  'js/runtime.js',
  'www/js/runtime.js',
  'android/app/src/main/assets/public/js/runtime.js'
];
for (const file of generatedRuntimeFiles) {
  const code = fs.readFileSync(file, 'utf8');
  assert.match(code, /if\s*\(typeof initEnumPickers === ['"]function['"]\)\s*\{\s*try\s*\{\s*initEnumPickers\(\);\s*\}\s*catch\s*\(e\)\s*\{\s*console\.error\(['"]initEnumPickers failed:['"],\s*e\);\s*\}\s*\}/,
    `${file} must initialize enum pickers during startup`);
  const match = code.match(/const EQUIP_SLOTS = (\[[^;]+\]);/);
  assert.ok(match, `${file} must declare EQUIP_SLOTS`);
  assert.deepStrictEqual([...vm.runInNewContext(match[1])], expectedEquipSlots,
    `${file} must match the canonical exclusive slot list`);
}

const generatedConstantsFiles = [
  'www/data/constants.js',
  'android/app/src/main/assets/public/data/constants.js'
];
for (const file of generatedConstantsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const match = code.match(/const EQUIP_SLOTS = (\[[^;]+\]);/);
  assert.ok(match, `${file} must declare EQUIP_SLOTS`);
  assert.deepStrictEqual([...vm.runInNewContext(match[1])], expectedEquipSlots,
    `${file} must match the canonical exclusive slot list`);
}

console.log('equipment-slot-contract: PASS');
