"use strict";

/**
 * Mobile-only UX helpers (Stage 2.2). No game-state access.
 * Keyboard / viewport / overscroll behaviour stays outside Game Core.
 */
(function initMobileUX() {
  const root = document.documentElement;
  const vv = window.visualViewport;

  function updateViewportVars() {
    if (!vv) {
      root.style.setProperty('--keyboard-height', '0px');
      root.classList.remove('keyboard-open');
      return;
    }
    const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty('--keyboard-height', `${Math.round(keyboardHeight)}px`);
    root.classList.toggle('keyboard-open', keyboardHeight > 100);
  }

  if (vv) {
    vv.addEventListener('resize', updateViewportVars, { passive: true });
    vv.addEventListener('scroll', updateViewportVars, { passive: true });
  }
  window.addEventListener('resize', updateViewportVars, { passive: true });
  window.addEventListener('orientationchange', () => {
    window.setTimeout(updateViewportVars, 200);
  }, { passive: true });
  updateViewportVars();

  // Keep focused form controls visible above the soft keyboard.
  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.matches('input, textarea, select')) return;
    window.setTimeout(() => {
      try {
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      } catch (_) {
        target.scrollIntoView(false);
      }
    }, 180);
  }, { passive: true });

  document.addEventListener('focusout', () => {
    window.setTimeout(updateViewportVars, 120);
  }, { passive: true });

  // Reduce accidental overscroll chaining while a blocking overlay is open.
  document.addEventListener('touchmove', (event) => {
    const overlay = document.querySelector(
      '.confirm-overlay, .raid-confirm-overlay, .ai-overlay, .achievement-unlock-overlay, .level-up-overlay, .first-launch-overlay, .craft-success-overlay'
    );
    if (!overlay || overlay.style.display === 'none') return;
    const scrollable = event.target instanceof Element
      ? event.target.closest('.confirm-box, .ai-overlay-card, .first-launch-card, .achievement-unlock-card')
      : null;
    if (scrollable) return;
    // Allow default only inside the scrollable card; block body rubber-band.
    if (event.cancelable) event.preventDefault();
  }, { passive: false });
})();
