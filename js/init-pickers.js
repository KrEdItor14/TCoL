"use strict";

function initEnumPickers() {
  if (typeof EnumPicker === 'undefined') {
    console.error('EnumPicker not loaded yet');
    return;
  }
  if (typeof EQUIP_SLOTS === 'undefined' || typeof ALL_SLOTS === 'undefined') {
    console.error('Constants not loaded yet');
    return;
  }

  const rarityOptions = [
    { value: 'common', label: 'Обычная', icon: '⚪', tone: 'common' },
    { value: 'uncommon', label: 'Необычная', icon: '🟢', tone: 'uncommon' },
    { value: 'rare', label: 'Редкая', icon: '🔵', tone: 'rare' },
    { value: 'epic', label: 'Эпическая', icon: '🟣', tone: 'epic' },
    { value: 'legendary', label: 'Легендарная', icon: '🟡', tone: 'legendary' },
    { value: 'unique', label: 'Уникальная', icon: '🟠', tone: 'unique' },
    { value: 'mythical', label: 'Мифическая', icon: '🔴', tone: 'mythical' }
  ];

  const conditionOptions = [
    { value: 'broken', label: 'Сломанное', icon: '🔴', tone: 'broken' },
    { value: 'damaged', label: 'Повреждённое', icon: '🟠', tone: 'damaged' },
    { value: 'worn', label: 'Потрёпанное', icon: '🟡', tone: 'worn' },
    { value: 'good', label: 'Хорошее', icon: '🟢', tone: 'good' },
    { value: 'reliable', label: 'Надёжное', icon: '🔵', tone: 'reliable' },
    { value: 'excellent', label: 'Отличное', icon: '🔷', tone: 'excellent' },
    { value: 'perfect', label: 'Идеальное', icon: '🟣', tone: 'perfect' }
  ];

  const questTypeOptions = [
    { value: 'обычный', label: 'Обычный' },
    { value: 'рейд', label: 'Рейд' }
  ];

  const difficultyOptions = [
    { value: 'trivial', label: 'Новичок', icon: '⚪', tone: 'difficulty-trivial' },
    { value: 'easy', label: 'Ученик', icon: '🟢', tone: 'difficulty-easy' },
    { value: 'normal', label: 'Адепт', icon: '🔵', tone: 'difficulty-normal' },
    { value: 'hard', label: 'Эксперт', icon: '🟣', tone: 'difficulty-hard' },
    { value: 'epic', label: 'Мастер', icon: '🟡', tone: 'difficulty-epic' }
  ];

  const slotGroups = [
    {
      label: 'Экипировка (по одному предмету)',
      items: EQUIP_SLOTS
    },
    {
      label: 'Аксессуары (можно несколько)',
      items: ACCESSORY_SLOTS
    }
  ];

  const slotOptions = ALL_SLOTS.map(slot => ({
    value: slot,
    label: slot,
    icon: SLOT_ICON[slot] || ''
  }));

  if (document.getElementById('gearNewRarityPicker')) {
    const rarityPicker = EnumPicker.create({
      targetId: 'gearNewRarity',
      options: rarityOptions,
      variant: 'modal',
      title: 'Редкость снаряжения',
      defaultValue: 'common'
    });
    document.getElementById('gearNewRarityPicker').appendChild(rarityPicker.container);
  }

  if (document.getElementById('gearNewConditionPicker')) {
    const conditionPicker = EnumPicker.create({
      targetId: 'gearNewCondition',
      options: conditionOptions,
      variant: 'modal',
      title: 'Состояние снаряжения',
      defaultValue: 'good'
    });
    document.getElementById('gearNewConditionPicker').appendChild(conditionPicker.container);
  }

  if (document.getElementById('gearNewSlotPicker')) {
    const slotPicker = EnumPicker.create({
      targetId: 'gearNewSlot',
      options: slotOptions,
      groups: slotGroups,
      defaultValue: EQUIP_SLOTS[0]
    });
    document.getElementById('gearNewSlotPicker').appendChild(slotPicker.container);
  }

  if (document.getElementById('qNewTypePicker')) {
    const typePicker = EnumPicker.create({
      targetId: 'qNewType',
      options: questTypeOptions,
      defaultValue: 'обычный'
    });
    document.getElementById('qNewTypePicker').appendChild(typePicker.container);
  }

  if (document.getElementById('qNewDifficultyPicker')) {
    const difficultyPicker = EnumPicker.create({
      targetId: 'qNewDifficulty',
      options: difficultyOptions,
      variant: 'modal',
      title: 'Сложность квеста',
      defaultValue: 'normal'
    });
    document.getElementById('qNewDifficultyPicker').appendChild(difficultyPicker.container);
  }

  if (document.getElementById('shopNewRarityPicker')) {
    const shopRarityPicker = EnumPicker.create({
      targetId: 'shopNewRarity',
      options: rarityOptions,
      variant: 'modal',
      title: 'Редкость товара',
      defaultValue: 'common'
    });
    document.getElementById('shopNewRarityPicker').appendChild(shopRarityPicker.container);
  }
}

function resetGearFormPickers() {
  if (typeof EnumPicker === 'undefined') return;
  const rarityPicker = EnumPicker.get('gearNewRarity');
  const conditionPicker = EnumPicker.get('gearNewCondition');
  const slotPicker = EnumPicker.get('gearNewSlot');
  if (rarityPicker) rarityPicker.reset('common');
  if (conditionPicker) conditionPicker.reset('good');
  if (slotPicker && typeof EQUIP_SLOTS !== 'undefined') slotPicker.reset(EQUIP_SLOTS[0]);
}
