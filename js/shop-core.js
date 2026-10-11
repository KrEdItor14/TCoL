"use strict";


/*
 * Shop Core
 * Игровая логика магазина не зависит от DOM.
 */
const ShopCore = (() => {
  function addItem(item) {
    if (!item || typeof item !== 'object') return null;
    if (!Array.isArray(S().shop)) S().shop = [];

    const normalized = {
      name: String(item.name || '✨ Загадочный товар'),
      price: Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : 30,
      rarity: RARITY_ORDER.includes(item.rarity) ? item.rarity : 'common',
      effect: String(item.effect || ''),
      durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
      secondaryEffect: String(item.secondaryEffect || ''),
      secondaryDurationMinutes: item.secondaryDurationMinutes
        ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15)
        : 0,
      quote: String(item.quote || '')
    };

    S().shop.push(normalized);
    return normalized;
  }

  function removeItem(index) {
    if (!Array.isArray(S().shop)) return null;
    if (!Number.isInteger(index) || index < 0 || index >= S().shop.length) return null;
    return S().shop.splice(index, 1)[0] || null;
  }

  function buyItem(index) {
    if (!Array.isArray(S().shop)) return { ok: false, reason: 'shop_empty' };
    if (!Number.isInteger(index) || index < 0 || index >= S().shop.length) {
      return { ok: false, reason: 'invalid_item' };
    }

    const item = S().shop[index];
    const price = Number.isFinite(Number(item.price)) ? Math.max(0, Math.trunc(Number(item.price))) : NaN;
    if (!Number.isFinite(price) || price < 0) return { ok: false, reason: 'invalid_price' };
    if (S().character.coins < price) return { ok: false, reason: 'not_enough_coins', item };

    addCoins(-price, item.name);
    const inventoryItem = InventoryCore.add({
      name: item.name,
      type: 'consumable',
      rarity: item.rarity || rollConsumableRarity(),
      desc: '',
      effect: item.effect || '',
      durationMinutes: normalizeConsumableDuration(item.durationMinutes, 30),
      secondaryEffect: item.secondaryEffect || '',
      secondaryDurationMinutes: item.secondaryDurationMinutes
        ? normalizeConsumableDuration(item.secondaryDurationMinutes, 15)
        : 0,
      quote: item.quote || '',
      source: 'shop'
    });

    return { ok: true, item, inventoryItem, price };
  }

  return { addItem, removeItem, buyItem };
})();
