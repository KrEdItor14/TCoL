"use strict";

function wireShopCreation(){
const addBtn = document.getElementById("shopNewAdd");
if (!addBtn) return;
addBtn.addEventListener("click", () => {
const name = document.getElementById("shopNewName");
const price = document.getElementById("shopNewPrice");
const rarity = document.getElementById("shopNewRarity");
const effect = document.getElementById("shopNewEffect");
const duration = document.getElementById("shopNewDuration");
if (!name || !price) return;
const nameVal = name.value.trim();
const priceVal = Math.trunc(Number(price.value));
const effectVal = effect ? effect.value.trim() : '';
const durationVal = normalizeConsumableDuration(duration ? duration.value : 30, 30);
if(!nameVal){ toast("Укажи название товара"); return; }
if(!priceVal || priceVal < 0){ toast("Укажи корректную цену"); return; }
if(!effectVal){ toast("Для расходника укажи бафф"); return; }
ShopCore.addItem({name: nameVal, price: priceVal, rarity: RARITY_ORDER.includes(rarity?.value) ? rarity.value : 'common', effect: effectVal, durationMinutes: durationVal, quote: ''});
name.value = "";
price.value = "";
if (effect) effect.value = "";
if (duration) duration.value = "";
persist(); renderAll();
toast(`Товар "${nameVal}" добавлен в магазин!`);
});
}

function wireShopAI(){
const genBtn = document.getElementById('aiShopGenerateBtn');
if (genBtn) {
genBtn.addEventListener('click', async () => {
if (!aiAvailable) { toast('🤖 AI недоступен'); return; }
const theme = (document.getElementById('aiShopTheme')?.value || '').trim();
try {
const item = await withAIThinking('🤖 Придумываю товар...', () => generateShopItemWithAI(theme));
ShopCore.addItem({
name: item.name || '✨ Загадочный товар',
price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : 30,
rarity: rollConsumableRarity(),
effect: item.effect || '',
durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
secondaryEffect: item.secondaryEffect || '',
secondaryDurationMinutes: item.secondaryDurationMinutes ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15) : 0,
quote: item.quote || ''
});
persist(); renderAll();
toast(`✅ Добавлено: ${item.name}`);
} catch(err) {
toastAIError(err);
}
});
}
}
