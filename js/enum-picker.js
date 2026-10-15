"use strict";

const EnumPicker = (() => {
  const pickers = new Map();

  function create(config) {
    const {
      targetId,
      options,
      groups = null,
      defaultValue = null,
      onChange = null,
      variant = 'chip',
      title = 'Выбор'
    } = config;

    const container = document.createElement('div');
    container.className = 'enum-picker';
    container.dataset.target = targetId;

    let currentValue = defaultValue || (options.length ? options[0].value : null);
    let trigger = null;

    function getOption(value) {
      return options.find(option => option.value === value) || null;
    }

    function appendOptionLabel(element, option) {
      if (option.icon) {
        const icon = document.createElement('span');
        icon.className = 'enum-picker-icon';
        icon.textContent = option.icon;
        element.appendChild(icon);
      }
      const label = document.createElement('span');
      label.textContent = option.label;
      element.appendChild(label);
    }

    function renderTrigger() {
      const option = getOption(currentValue);
      if (!trigger || !option) return;
      trigger.className = `btn enum-picker-trigger${option.tone ? ` enum-picker-trigger-${option.tone}` : ''}`;
      while (trigger.firstChild) trigger.removeChild(trigger.firstChild);
      appendOptionLabel(trigger, option);
    }

    function closeModal(overlay) {
      overlay.remove();
    }

    function openModal() {
      const overlay = document.createElement('div');
      overlay.className = 'enum-picker-overlay';
      overlay.setAttribute('role', 'presentation');

      const dialog = document.createElement('div');
      dialog.className = 'enum-picker-modal';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');

      const heading = document.createElement('h3');
      heading.textContent = title;
      dialog.appendChild(heading);

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'enum-picker-modal-close';
      close.textContent = '×';
      close.setAttribute('aria-label', 'Закрыть');
      close.addEventListener('click', () => closeModal(overlay));
      dialog.appendChild(close);

      const list = document.createElement('div');
      list.className = 'enum-picker-modal-options';
      options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `enum-picker-option${option.tone ? ` enum-picker-option-${option.tone}` : ''}${option.value === currentValue ? ' active' : ''}`;
        button.dataset.value = option.value;
        button.setAttribute('aria-pressed', option.value === currentValue ? 'true' : 'false');
        appendOptionLabel(button, option);
        button.addEventListener('click', () => {
          selectValue(option.value);
          closeModal(overlay);
        });
        list.appendChild(button);
      });

      dialog.appendChild(list);
      overlay.appendChild(dialog);
      overlay.addEventListener('click', event => {
        if (event.target === overlay) closeModal(overlay);
      });
      document.body.appendChild(overlay);
      close.focus();
    }

    function createChip(option, active) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'enum-picker-chip' + (active ? ' active' : '');
      chip.dataset.value = option.value;
      appendOptionLabel(chip, option);
      chip.addEventListener('click', () => selectValue(option.value));
      return chip;
    }

    function renderChips() {
      if (groups && groups.length) {
        groups.forEach(group => {
          const groupEl = document.createElement('div');
          groupEl.className = 'enum-picker-group';
          if (group.label) {
            const labelEl = document.createElement('div');
            labelEl.className = 'enum-picker-group-label';
            labelEl.textContent = group.label;
            groupEl.appendChild(labelEl);
          }
          const rowEl = document.createElement('div');
          rowEl.className = 'enum-picker-row';
          group.items.forEach(value => {
            const option = getOption(value);
            if (option) rowEl.appendChild(createChip(option, value === currentValue));
          });
          groupEl.appendChild(rowEl);
          container.appendChild(groupEl);
        });
        return;
      }

      const rowEl = document.createElement('div');
      rowEl.className = 'enum-picker-row';
      options.forEach(option => rowEl.appendChild(createChip(option, option.value === currentValue)));
      container.appendChild(rowEl);
    }

    function renderModal() {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'btn enum-picker-trigger';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.addEventListener('click', openModal);
      container.appendChild(trigger);
      renderTrigger();
    }

    function selectValue(value) {
      if (currentValue === value || !getOption(value)) return;
      currentValue = value;
      if (variant === 'modal') renderTrigger();
      else {
        container.querySelectorAll('.enum-picker-chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.value === value);
        });
      }
      const target = document.getElementById(targetId);
      if (target) {
        target.value = value;
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (onChange) onChange(value);
    }

    if (variant === 'modal') renderModal();
    else renderChips();

    function reset(value) {
      const resetValue = value !== undefined ? value : (defaultValue || (options.length ? options[0].value : null));
      selectValue(resetValue);
    }

    const picker = { container, selectValue, reset, getValue: () => currentValue };
    pickers.set(targetId, picker);
    return picker;
  }

  function destroy(targetId) {
    const picker = pickers.get(targetId);
    if (picker && picker.container.parentNode) {
      picker.container.parentNode.removeChild(picker.container);
    }
    pickers.delete(targetId);
  }

  function get(targetId) {
    return pickers.get(targetId);
  }

  return { create, destroy, get };
})();
