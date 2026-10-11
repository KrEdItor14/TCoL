"use strict";


// Settings Core: settings state transitions only. No DOM or persistence side effects.
const SettingsCore = (() => {
  function ensure() {
    if (!S().settings || typeof S().settings !== 'object') S().settings = {};
    return S().settings;
  }

  function setTheme(themeId) {
    const exists = Array.isArray(THEMES) && THEMES.some(theme => theme.id === themeId);
    if (!exists) return { ok:false, reason:'invalid_theme' };
    ensure().theme = themeId;
    return { ok:true, theme:themeId };
  }

  function setSoundEnabled(on) {
    ensure().soundEnabled = !!on;
    return { ok:true, soundEnabled: ensure().soundEnabled };
  }

  function setNotificationsEnabled(on) {
    ensure().notificationsEnabled = !!on;
    return { ok:true, notificationsEnabled: ensure().notificationsEnabled };
  }

  function setAITheme(theme) {
    if (!Object.prototype.hasOwnProperty.call(AI_THEME_OPTIONS, theme)) return { ok:false, reason:'invalid_theme' };
    ensure().aiTheme = theme;
    return { ok:true, theme };
  }

  function setAIProvider(provider, options = {}) {
    if (provider !== 'tooken') return { ok:false, reason:'invalid_provider' };
    const settings = ensure();
    settings.aiProvider = provider;
    settings.aiModel = 'deepseek-v4-flash';
    return { ok:true, provider, model:settings.aiModel, persist:options.persist !== false };
  }

  function setAIModel(model, provider = null) {
    if (!Object.prototype.hasOwnProperty.call(AI_MODEL_OPTIONS, model)) return { ok:false, reason:'invalid_model' };
    const activeProvider = provider || (S().settings?.aiProvider || DEFAULT_AI_PROVIDER);
    if (activeProvider !== 'tooken') return { ok:false, reason:'model_provider_mismatch' };
    ensure().aiModel = model;
    return { ok:true, model };
  }

  function setAIMode(mode) {
    if (mode !== 'free' && mode !== 'own_key') return { ok:false, reason:'invalid_mode' };
    ensure().aiMode = mode;
    return { ok:true, mode };
  }

  function setAIOwnKey(key) {
    const settings = ensure();
    const trimmed = (key == null ? '' : String(key)).trim();
    settings.aiOwnKey = trimmed || null;
    return { ok:true, hasKey: !!settings.aiOwnKey };
  }

  function clearAIOwnKey() {
    ensure().aiOwnKey = null;
    return { ok:true };
  }

  /** Сбрасывает окно при необходимости и возвращает актуальное состояние лимита (скользящие 24 ч) */
  function getAIFreeUsage() {
    const settings = ensure();
    const now = Date.now();
    const windowMs = 24 * 60 * 60 * 1000;
    const limit = Number(settings.aiDailyFreeLimit) || 10;

    if (!settings.aiFreeWindowStart || (now - Number(settings.aiFreeWindowStart)) >= windowMs) {
      settings.aiFreeUsed = 0;
      settings.aiFreeWindowStart = now;
    }

    const used = Math.max(0, Number(settings.aiFreeUsed) || 0);
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      windowStart: settings.aiFreeWindowStart
    };
  }

  function incrementAIFreeUsage() {
    getAIFreeUsage(); // сбросит окно при необходимости
    const settings = ensure();
    settings.aiFreeUsed = Math.max(0, Number(settings.aiFreeUsed) || 0) + 1;
    return getAIFreeUsage();
  }

  return Object.freeze({
    setTheme,
    setSoundEnabled,
    setNotificationsEnabled,
    setAITheme,
    setAIProvider,
    setAIModel,
    setAIMode,
    setAIOwnKey,
    clearAIOwnKey,
    getAIFreeUsage,
    incrementAIFreeUsage
  });
})();
