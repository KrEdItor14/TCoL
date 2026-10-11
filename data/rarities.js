"use strict";



const RARITY_ORDER = ['common','uncommon','rare','epic','legendary','unique','mythical'];

const RARITY_LABEL = { common:'Обычная', uncommon:'Необычная', rare:'Редкая', epic:'Эпическая', legendary:'Легендарная', unique:'Уникальная', mythical:'Мифическая' };

const CONSUMABLE_RARITY_WEIGHTS = [
    ['common', 60], ['uncommon', 25], ['rare', 10], ['epic', 4],
    ['legendary', 0.9], ['unique', 0.09], ['mythical', 0.01]
];
