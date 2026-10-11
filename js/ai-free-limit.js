"use strict";

// Local usage is an estimate for display only; the AI Worker enforces the quota.
const AiFreeLimit = (() => {
  const LIMIT = 10;
  const WINDOW_MS = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'tcol-ai-free-limit';
  let memoryState = null;

  function readStored() {
    try {
      const raw = typeof StorageService !== 'undefined' ? StorageService.load(STORAGE_KEY) : null;
      return raw ? JSON.parse(raw) : memoryState;
    } catch (error) {
      console.warn('Could not read local AI quota estimate:', error);
      return memoryState;
    }
  }

  function writeStored(value) {
    memoryState = value;
    try {
      if (typeof StorageService !== 'undefined') StorageService.save(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.warn('Could not persist local AI quota estimate:', error);
    }
    return value;
  }

  function getState() {
    const now = Date.now();
    const raw = readStored();
    const timestamps = Array.isArray(raw?.timestamps)
      ? raw.timestamps.map(Number).filter(timestamp => Number.isFinite(timestamp) && timestamp > now - WINDOW_MS && timestamp <= now)
      : [];
    if (!raw || timestamps.length !== raw.timestamps?.length) return writeStored({ timestamps });
    memoryState = { timestamps };
    return memoryState;
  }

  function hasUserOwnApiKey() {
    const settings = typeof state !== 'undefined' ? state?.settings : null;
    return settings?.aiMode === 'own_key' && !!String(settings?.aiOwnKey || '').trim();
  }

  function getLimitStatus() {
    const current = getState();
    const remaining = Math.max(0, LIMIT - current.timestamps.length);
    return {
      used: current.timestamps.length,
      limit: LIMIT,
      remaining,
      windowStart: current.timestamps.length ? Math.min(...current.timestamps) : null,
      hasOwnKey: hasUserOwnApiKey(),
      unlimited: hasUserOwnApiKey(),
      authoritative: false
    };
  }

  function consumeGeneration() {
    if (hasUserOwnApiKey()) return { ok: true, unlimited: true, ...getLimitStatus() };
    const current = getState();
    if (current.timestamps.length >= LIMIT) return { ok: false, ...getLimitStatus() };
    current.timestamps.push(Date.now());
    writeStored(current);
    return { ok: true, ...getLimitStatus() };
  }

  function getLimitIndicatorText() {
    const status = getLimitStatus();
    return status.unlimited
      ? 'Режим личного ключа: лимит приложения отключён.'
      : `Осталось примерно ${status.remaining} из ${LIMIT} запросов за скользящие 24 ч`;
  }

  function debugResetLimit() {
    return writeStored({ timestamps: [] });
  }

  return Object.freeze({
    getAiFreeLimit: () => LIMIT,
    getAvailableGenerations: () => hasUserOwnApiKey() ? Infinity : getLimitStatus().remaining,
    canGenerate: () => hasUserOwnApiKey() || getLimitStatus().remaining > 0,
    consumeGeneration,
    getLimitStatus,
    getLimitIndicatorText,
    hasUserOwnApiKey,
    debugResetLimit
  });
})();

if (typeof window !== 'undefined') window.AiFreeLimit = AiFreeLimit;
