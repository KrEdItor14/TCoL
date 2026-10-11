"use strict";


function getCraftGenerationLimitState(){
if (S().character.craftGenLevel !== S().character.level) {
S().character.craftGenLevel = S().character.level;
S().character.craftGenCount = 0;

}
return { count: Number(S().character.craftGenCount) || 0, limit: 3 };
}


function craftRecipe(idx){
const recipe = S().craftRecipes[idx];
if (!recipe) return { ok:false, reason:'recipe_not_found' };
const normalizedMaterials = (recipe.materials || []).map(m => typeof m === 'string' ? ({name:m, qty:1}) : m);
if (normalizedMaterials.length < 2) return { ok:false, reason:'invalid_recipe' };
for (const mat of normalizedMaterials) {
const qty = Math.max(1, Math.floor(Number(mat.qty) || 1));
const item = S().inventory.find(i => i.name === mat.name && (i.qty||1) >= qty);
if (!item) return { ok:false, reason:'missing_material', material: mat.name, qty };
}
for (const mat of normalizedMaterials) {
const qty = Math.max(1, Math.floor(Number(mat.qty) || 1));
const mIdx = S().inventory.findIndex(i => i.name === mat.name);
const item = S().inventory[mIdx];
item.qty = (item.qty || 1) - qty;
if (item.qty <= 0) S().inventory.splice(mIdx, 1);
}
const isConsumable = recipe.type === 'consumable';
const result = InventoryCore.add(isConsumable ? {
name: recipe.name, type: 'consumable', category: recipe.category || 'Эликсир', rarity: recipe.rarity || 'common',
desc: recipe.desc || `Скрафчено из: ${normalizedMaterials.map(m => `${m.name} ×${Number(m.qty)||1}`).join(', ')}`,
effect: recipe.effect || '', durationMinutes: normalizeConsumableDuration(recipe.durationMinutes, 30),
secondaryEffect: recipe.secondaryEffect || '', secondaryDurationMinutes: recipe.secondaryDurationMinutes ? normalizeConsumableDuration(recipe.secondaryDurationMinutes, 15) : 0,
source: 'craft'
} : {
name: recipe.name, type: 'equipment', category: recipe.category || recipe.slot || 'Аксессуар', rarity: recipe.rarity || 'common',
desc: recipe.desc || `Скрафчено из: ${normalizedMaterials.map(m => `${m.name} ×${Number(m.qty)||1}`).join(', ')}`, effect: recipe.effect || '',
slot: recipe.slot || SLOT_ORDER[0], itemLevel: Number(recipe.itemLevel) > 0 ? Math.floor(Number(recipe.itemLevel)) : (Number(S().character?.level) || 1), source: 'craft'
});
return { ok:true, item: result, events:[{ type:'craft', icon:isConsumable ? '🧪' : '🛠️', text:`Создан ${isConsumable ? 'расходник' : 'предмет'}: ${result.name}` }] };
}


function addCraftRecipe(recipe){
  if (!recipe) return false;
  S().craftRecipes.push(recipe);
  S().character.craftGenCount = (Number(S().character.craftGenCount) || 0) + 1;
  return true;
}

function deleteCraftRecipe(idx){
  const index = Number(idx);
  if (!Number.isInteger(index) || index < 0 || index >= S().craftRecipes.length) return { ok:false, reason:'recipe_not_found' };
  const recipe = S().craftRecipes[index];
  S().craftRecipes.splice(index, 1);
  return { ok:true, recipe };
}
