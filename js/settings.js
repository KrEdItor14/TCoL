"use strict";

function applyTheme(themeId){
document.documentElement.setAttribute('data-theme', themeId === 'nature' ? '' : themeId);
}

function renderSettings(){
const soundToggle = document.getElementById('soundEnabledToggle');
if (soundToggle) {
  const on = state.settings.soundEnabled !== false;
  soundToggle.checked = on;
  soundToggle.setAttribute('aria-checked', on ? 'true' : 'false');
  const label = document.getElementById('soundEnabledLabel');
  if (label) label.textContent = on ? 'Включен' : 'Выключен';
}
const notifToggle = document.getElementById('notificationsEnabledToggle');
if (notifToggle) {
  const on = state.settings.notificationsEnabled !== false;
  notifToggle.checked = on;
  notifToggle.setAttribute('aria-checked', on ? 'true' : 'false');
  const label = document.getElementById('notificationsEnabledLabel');
  if (label) label.textContent = on ? 'Включены' : 'Выключены';
}
const grid = document.getElementById('themeGrid');
if (grid) {
grid.innerHTML = THEMES.map(t => `
<div class="theme-swatch ${state.settings.theme === t.id ? 'active' : ''}" data-theme-pick="${t.id}">
<div class="dots">${t.dots.map(c => `<span class="dot" style="background:${c}"></span>`).join('')}</div>
${t.label}
</div>
`).join('');
grid.querySelectorAll('[data-theme-pick]').forEach(el => el.addEventListener('click', () => {
const result = SettingsCore.setTheme(el.dataset.themePick);
if (!result.ok) return;
applyTheme(result.theme);
persist(); renderSettings();
}));
}

// --- AI settings ---
const themeSelect = document.getElementById('aiThemeSelect');
const themePickLabel = document.getElementById('aiThemePickLabel');
const themeDescription = document.getElementById('aiThemeDescription');
const theme = typeof getAITheme === 'function' ? getAITheme() : (state.settings.aiTheme || 'real_world');
if (themeSelect) themeSelect.value = theme;
if (themePickLabel) themePickLabel.textContent = AI_THEME_OPTIONS[theme] || AI_THEME_OPTIONS.real_world;
if (themeDescription) themeDescription.textContent = AI_THEME_DESCRIPTIONS[theme] || AI_THEME_DESCRIPTIONS.real_world;
const modelSelect = document.getElementById('aiModelSelect');
if (modelSelect) modelSelect.value = typeof getAIModel === 'function' ? getAIModel() : 'deepseek-v4-flash';
const modelPickLabel = document.getElementById('aiModelPickLabel');
if (modelPickLabel) modelPickLabel.textContent = AI_MODEL_OPTIONS[modelSelect?.value] || AI_MODEL_OPTIONS['deepseek-v4-flash'];
const modelDescription = document.getElementById('aiModelDescription');
if (modelDescription) modelDescription.textContent = AI_MODEL_DESCRIPTIONS[modelSelect?.value] || AI_MODEL_DESCRIPTIONS['deepseek-v4-flash'];
const modelCostHint = document.getElementById('aiModelCostHint');
if (modelCostHint) modelCostHint.textContent = `Стоимость: ${AI_MODEL_COSTS[modelSelect?.value] || AI_MODEL_COSTS['deepseek-v4-flash']} от базовой стоимости токенов.`;
const ownKeyBlock = document.getElementById('aiOwnKeyBlock');
if (ownKeyBlock) ownKeyBlock.style.display = 'block';
const keyInput = document.getElementById('aiOwnKeyInput');
if (keyInput) {
  if (state.settings?.aiOwnKey) {
    keyInput.value = '';
    keyInput.placeholder = 'Ключ сохранён (введи новый, чтобы заменить)';
  } else {
    keyInput.placeholder = 'tc_live_...';
  }
}
if (typeof updateAIStatus === 'function') updateAIStatus();
}

function wireSettings(){
    const themeSelect = document.getElementById('aiThemeSelect');
    const themePickBtn = document.getElementById('aiThemePickBtn');
    const openPicker = (title, options, selectedValue, onSelect, showCost = false) => {
      const overlay = document.createElement('div');
      overlay.className = 'ai-settings-picker-overlay';
      overlay.setAttribute('role', 'presentation');

      const dialog = document.createElement('div');
      dialog.className = 'ai-settings-picker';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      const heading = document.createElement('h3');
      heading.textContent = title;
      dialog.appendChild(heading);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'ai-settings-picker-close';
      close.textContent = '×';
      close.setAttribute('aria-label', 'Закрыть');
      close.addEventListener('click', () => overlay.remove());
      dialog.appendChild(close);

      const list = document.createElement('div');
      list.className = 'ai-settings-picker-options';
      options.forEach(([value, label, description, cost]) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = `ai-settings-picker-option${value === selectedValue ? ' active' : ''}`;
        option.setAttribute('aria-pressed', value === selectedValue ? 'true' : 'false');

        const name = document.createElement('span');
        name.className = 'ai-settings-picker-name';
        name.textContent = label;
        option.appendChild(name);
        if (showCost && cost) {
          const price = document.createElement('span');
          price.className = 'ai-settings-picker-cost';
          price.textContent = cost;
          option.appendChild(price);
        }
        const detail = document.createElement('span');
        detail.className = 'ai-settings-picker-description';
        detail.textContent = description;
        option.appendChild(detail);
        option.addEventListener('click', () => {
          onSelect(value);
          overlay.remove();
        });
        list.appendChild(option);
      });
      dialog.appendChild(list);
      overlay.appendChild(dialog);
      overlay.addEventListener('click', event => {
        if (event.target === overlay) overlay.remove();
      });
      document.body.appendChild(overlay);
      close.focus();
    };
    const applyAITheme = (value) => {
      const result = SettingsCore.setAITheme(value);
      if (!result.ok) return false;
      persist();
      renderSettings();
      return true;
    };
    if (themeSelect && !themeSelect.dataset.wired) {
      themeSelect.dataset.wired = '1';
      themeSelect.value = typeof getAITheme === 'function' ? getAITheme() : 'real_world';
      themeSelect.addEventListener('change', () => {
        if (applyAITheme(themeSelect.value)) toast(`🎭 Атмосфера: ${AI_THEME_OPTIONS[themeSelect.value]}`);
      });
    }
    if (themePickBtn && !themePickBtn.dataset.wired) {
      themePickBtn.dataset.wired = '1';
      themePickBtn.addEventListener('click', () => {
        const current = typeof getAITheme === 'function' ? getAITheme() : 'real_world';
        const options = Object.entries(AI_THEME_OPTIONS).map(([value, label]) =>
          [value, label, AI_THEME_DESCRIPTIONS[value]]
        );
        openPicker('🎭 Атмосфера контента', options, current, value => {
          themeSelect.value = value;
          themeSelect.dispatchEvent(new Event('change'));
        });
      });
    }

    const soundToggle = document.getElementById('soundEnabledToggle');
    if (soundToggle && !soundToggle.dataset.wired) {
      soundToggle.dataset.wired = '1';
      soundToggle.addEventListener('change', () => {
        const on = !!soundToggle.checked;
        const result = SettingsCore.setSoundEnabled(on);
        if (!result.ok) return;
        persist();
        if (typeof Sound !== 'undefined') {
          if (on) Sound.play('toggleOn');
          else Sound.play('toggleOff');
        }
        renderSettings();
        toast(on ? '🔊 Звук включен' : '🔇 Звук выключен');
      });
    }
    const notifToggle = document.getElementById('notificationsEnabledToggle');
    if (notifToggle && !notifToggle.dataset.wired) {
      notifToggle.dataset.wired = '1';
      notifToggle.addEventListener('change', async () => {
        const on = !!notifToggle.checked;
        const result = SettingsCore.setNotificationsEnabled(on);
        if (!result.ok) return;
        persist();
        if (!on && typeof Notifications !== 'undefined') {
          await Notifications.cancelRaid();
        }
        if (on && typeof Notifications !== 'undefined') {
          const granted = await Notifications.requestPermission();
          if (!granted) toast('⚠️ Разреши уведомления в системе Android');
          else toast('🔔 Уведомления включены');
        } else {
          toast(on ? '🔔 Уведомления включены' : '🔕 Уведомления выключены');
        }
        renderSettings();
      });
    }

    const saveKeyBtn = document.getElementById('aiOwnKeySaveBtn');
    if (saveKeyBtn && !saveKeyBtn.dataset.wired) {
      saveKeyBtn.dataset.wired = '1';
      saveKeyBtn.addEventListener('click', () => {
        const val = (document.getElementById('aiOwnKeyInput')?.value || '').trim();
        const result = SettingsCore.setAIOwnKey(val);
        if (!result.ok) return;
        persist();
        if (typeof updateAIStatus === 'function') updateAIStatus();
        renderSettings();
        toast(result.hasKey ? '✅ Ключ сохранён локально' : 'Ключ очищен');
      });
    }

    const clearKeyBtn = document.getElementById('aiOwnKeyClearBtn');
    if (clearKeyBtn && !clearKeyBtn.dataset.wired) {
      clearKeyBtn.dataset.wired = '1';
      clearKeyBtn.addEventListener('click', () => {
        SettingsCore.clearAIOwnKey();
        const input = document.getElementById('aiOwnKeyInput');
        if (input) {
          input.value = '';
          input.placeholder = 'tc_live_...';
        }
        persist();
        if (typeof updateAIStatus === 'function') updateAIStatus();
        renderSettings();
        toast('🔑 Ключ удалён');
      });
    }

    const providerSelect = document.getElementById('aiProviderSelect');
    if (providerSelect) {
      providerSelect.value = 'tooken';
      if (!providerSelect.dataset.wired) {
        providerSelect.dataset.wired = '1';
        providerSelect.addEventListener('change', () => {
          if (typeof setAIProvider === 'function') setAIProvider(providerSelect.value);
          const modelSelect = document.getElementById('aiModelSelect');
          if (modelSelect && typeof getAIModel === 'function') modelSelect.value = getAIModel();
          toast(`🤖 Провайдер: ${AI_PROVIDER_OPTIONS?.[getAIProvider?.()] || providerSelect.value}`);
        });
      }
    }
    const modelSelect = document.getElementById('aiModelSelect');
    if (modelSelect) {
      modelSelect.value = typeof getAIModel === 'function' ? getAIModel() : 'deepseek-v4-flash-0731';
      if (!modelSelect.dataset.wired) {
        modelSelect.dataset.wired = '1';
        modelSelect.addEventListener('change', () => {
          if (typeof setAIModel === 'function' && !setAIModel(modelSelect.value)) {
            renderSettings();
            return;
          }
          renderSettings();
          toast(`🤖 Модель: ${typeof getAIModelLabel === 'function' ? getAIModelLabel() : modelSelect.value}`);
        });
      }
    }
    const modelPickBtn = document.getElementById('aiModelPickBtn');
    if (modelPickBtn && modelSelect && !modelPickBtn.dataset.wired) {
      modelPickBtn.dataset.wired = '1';
      modelPickBtn.addEventListener('click', () => {
        const current = typeof getAIModel === 'function' ? getAIModel() : modelSelect.value;
        const options = Object.entries(AI_MODEL_OPTIONS).map(([value, label]) =>
          [value, label, AI_MODEL_DESCRIPTIONS[value], AI_MODEL_COSTS[value]]
        );
        openPicker('🧠 Выбор модели', options, current, value => {
          modelSelect.value = value;
          modelSelect.dispatchEvent(new Event('change'));
        }, true);
      });
    }
  }
