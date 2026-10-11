"use strict";

/**
 * Native Android bridge for Capacitor 8.
 * Keeps platform concerns out of game/core modules.
 */
(function initCapacitorBridge() {
    const capacitor = window.Capacitor;
    const plugins = capacitor && capacitor.Plugins;
    if (!capacitor || !plugins) return;

    const App = plugins.App;
    const SystemBars = plugins.SystemBars;
    const SplashScreen = plugins.SplashScreen;
    if (!App) return;

    // Prefer portrait on phones; CSS landscape guard remains the fallback.
    function lockPortrait() {
        try {
            if (screen.orientation && typeof screen.orientation.lock === 'function') {
                screen.orientation.lock('portrait').catch(() => {});
            }
        } catch (_) {}
    }
    lockPortrait();

    let saveInFlight = null;
    let backLock = false;

    // Capacitor listener registration is not guaranteed to return a Promise.
    // In current builds it returns a listener handle, so registration errors
    // must be handled synchronously instead of calling .catch() on the handle.
    function safeAddListener(eventName, handler) {
        try {
            return App.addListener(eventName, handler);
        } catch (error) {
            console.warn(`[Capacitor] ${eventName} listener registration failed:`, error);
            return null;
        }
    }

    function isOverlayBlockingBack() {
        const firstLaunch = document.getElementById('firstLaunchOverlay');
        if (firstLaunch && firstLaunch.style.display !== 'none') return true;

        const ai = document.getElementById('aiThinkingOverlay');
        if (ai && ai.style.display !== 'none') {
            const cancel = document.getElementById('aiThinkingCancelBtn');
            if (cancel) cancel.click();
            return true;
        }

        const confirm = document.querySelector('.confirm-overlay');
        if (confirm) {
            const cancel = confirm.querySelector('#confirmCancel');
            if (cancel) cancel.click();
            else confirm.remove();
            return true;
        }

        const achievement = document.querySelector('.achievement-unlock-overlay');
        if (achievement) {
            achievement.click();
            return true;
        }

        const openMenu = document.querySelector('.tab-group-collapsible.open');
        if (openMenu) {
            document.dispatchEvent(new CustomEvent('tcol:native-back'));
            return true;
        }
        return false;
    }

    function requestDurableSave(reason) {
        try {
            if (typeof flushPendingSave === 'function') flushPendingSave(false);
            if (typeof saveGameDurable !== 'function') return Promise.resolve(false);
            saveInFlight = Promise.resolve()
                .then(() => saveGameDurable())
                .then(() => {
                    console.info('[Capacitor] durable save:', reason);
                    return true;
                })
                .catch(error => {
                    console.warn('[Capacitor] durable save failed:', reason, error);
                    return false;
                })
                .finally(() => { saveInFlight = null; });
            return saveInFlight;
        } catch (error) {
            console.warn('[Capacitor] durable save scheduling failed:', error);
            return Promise.resolve(false);
        }
    }

    safeAddListener('backButton', async () => {
        if (backLock) return;
        backLock = true;
        try {
            if (isOverlayBlockingBack()) return;

            const activePanel = document.querySelector('section.panel.active');
            const isHome = !activePanel || activePanel.id === 'panel-char';

            if (!isHome) {
                // First Back from any secondary tab always returns to the main screen.
                // Route this through the existing DOM navigation event so the native
                // bridge does not depend on the load order of app.js.
                if (typeof closeTabMenu === 'function') closeTabMenu();
                document.dispatchEvent(new CustomEvent('tcol:native-back'));
                return;
            }

            // Second Back from the main screen exits the application.
            if (typeof App.exitApp === 'function') await App.exitApp();
        } finally {
            setTimeout(() => { backLock = false; }, 250);
        }
    });

    safeAddListener('appStateChange', ({ isActive }) => {
        if (!isActive) requestDurableSave('background');
    });

    safeAddListener('resume', () => {
        try {
            lockPortrait();
            if (typeof updateDateTime === 'function') updateDateTime();
            if (typeof updateActiveBuffsHeader === 'function') updateActiveBuffsHeader();
        } catch (error) {
            console.warn('[Capacitor] resume refresh failed:', error);
        }
    });

    if (SystemBars) {
        // Keep Android status bar fully visible (user preference).
        // DARK style => light icons on our dark header background.
        SystemBars.setStyle({ style: 'DARK' }).catch(() => {});
        if (typeof SystemBars.show === 'function') {
            SystemBars.show().catch(() => {});
        }
        // Do not auto-hide; safe-area CSS already accounts for the bar.
    }

    if (SplashScreen) {
        // Hide only after the web UI has had a chance to initialize.
        // Keep native splash briefly; custom #bootSplash takes over with logo animation
        window.setTimeout(() => SplashScreen.hide().catch(() => {}), 120);
    }


    // Navigation handler is installed only after the complete web runtime has loaded.
    document.addEventListener('tcol:native-back', () => {
        try {
            if (typeof closeTabMenu === 'function') closeTabMenu();
            const activePanel = document.querySelector('section.panel.active');
            if (activePanel && activePanel.id !== 'panel-char' && typeof switchTab === 'function') {
                switchTab('char');
            }
        } catch (error) {
            console.warn('[Capacitor] native back navigation failed:', error);
        }
    });

    window.TCoLNative = Object.freeze({
        isCapacitor: true,
        saveNow: () => requestDurableSave('manual'),
        savePending: () => saveInFlight || Promise.resolve(true)
    });
})();
