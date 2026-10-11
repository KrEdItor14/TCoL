"use strict";

function renderEconomy(){
const elCoins = document.getElementById("coinsBig");
const log = document.getElementById("coinLog");
const shop = document.getElementById("shopList");
const shopStatus = document.getElementById("shopStatus");
if (elCoins) elCoins.textContent = fmt(state.character.coins) + " 🪙";
if (log) {
log.innerHTML = "";
const last5 = [...state.coinLog].slice(-5);
last5.forEach(l=>{
const row = document.createElement("div");
row.className = "log-row";
const deltaStr = l.delta === 0 ? "" : (l.delta > 0 ? "+"+l.delta : l.delta) + "🪙";
row.innerHTML = `<span>${l.label}</span><span class="delta ${l.delta<0?'neg':'pos'}">${deltaStr} <span class="muted">(${fmt(l.running)})</span></span>`;
log.appendChild(row);
});
}
if (shopStatus) {
shopStatus.textContent = "Статус: активен";
}
if (shop) {
shop.innerHTML = "";
state.shop.forEach((item, idx)=>{
const row = document.createElement("div");
row.className = "shop-item";
const priceStr = item.price === null ? "цена не зафиксирована" : item.price + "🪙";
row.innerHTML = `
<div>
<div>${escapeHtml(item.name)}</div>
${item.rarity ? `<span class="rarity ${item.rarity}">${RARITY_LABEL[item.rarity]||item.rarity}</span>` : ''}
${item.effect ? `<div class="trait" style="margin-top:2px;">✨ ${escapeHtml(item.effect)}${item.durationMinutes ? ` · ${normalizeConsumableDuration(item.durationMinutes)} мин` : ''}</div>` : ''}
${item.secondaryEffect ? `<div class="sub" style="margin-top:2px;">↘ ${escapeHtml(item.secondaryEffect)}</div>` : ''}
${item.quote ? `<div class="item-quote">«${escapeHtml(item.quote)}»</div>` : ''}
</div>
<div>
<span>${priceStr}</span>
${item.price!==null ? '<button class="btn" data-buy="'+idx+'">Купить</button>' : ''}
<button class="btn danger" data-delshop="${idx}" style="padding:6px 8px;">🗑 Убрать</button>
</div>
`;
const buyBtn = row.querySelector("[data-buy]");
if(buyBtn) buyBtn.addEventListener("click", async ()=>{
const result = ShopCore.buyItem(idx);
if (!result.ok) {
if (result.reason === 'not_enough_coins') toast("Недостаточно монет");
else toast("Не удалось купить товар");
return;
}
persist(); renderAll();
toast(`Куплено: ${item.name}`);
});
const delBtn = row.querySelector("[data-delshop]");
if(delBtn) delBtn.addEventListener("click", ()=>{
showConfirm(
'🗑️ Убрать из продажи',
`Безвозвратно убрать "${item.name}" из магазина?`,
() => {
const removed = ShopCore.removeItem(idx);
if (!removed) return;
persist(); renderAll();
toast("Товар убран из продажи");
}
);
});
shop.appendChild(row);
});
}
}
