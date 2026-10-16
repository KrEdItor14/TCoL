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

  return Object.freeze({
    setTheme,
    setSoundEnabled,
    setNotificationsEnabled,
    setAITheme,
    setAIProvider,
    setAIModel,
    setAIOwnKey,
    clearAIOwnKey
  });
})();
