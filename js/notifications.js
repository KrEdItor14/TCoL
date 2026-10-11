"use strict";

/* Local notifications — raid timer end (Capacitor LocalNotifications + web fallback). */

const Notifications = (() => {
  const RAID_ID = 71001;
  let permissionAsked = false;

  function enabled() {
    try {
      if (typeof state !== "undefined" && state && state.settings && state.settings.notificationsEnabled === false) {
        return false;
      }
    } catch (_) {}
    return true;
  }

  function plugin() {
    try {
      const cap = window.Capacitor;
      const p = cap && cap.Plugins && cap.Plugins.LocalNotifications;
      return p || null;
    } catch (_) {
      return null;
    }
  }

  function isNative() {
    try {
      return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
    } catch (_) {
      return false;
    }
  }

  async function requestPermission() {
    if (!enabled()) return false;
    const ln = plugin();
    if (ln && typeof ln.requestPermissions === "function") {
      try {
        const res = await ln.requestPermissions();
        permissionAsked = true;
        const display = res && (res.display || res.receive);
        return display === "granted" || display === "prompt";
      } catch (_) {
        return false;
      }
    }
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        const res = await Notification.requestPermission();
        permissionAsked = true;
        return res === "granted";
      } catch (_) {
        return false;
      }
    }
    if (typeof Notification !== "undefined") return Notification.permission === "granted";
    return false;
  }

  async function ensurePermission() {
    if (!enabled()) return false;
    if (typeof Notification !== "undefined" && Notification.permission === "granted") return true;
    const ln = plugin();
    if (ln && typeof ln.checkPermissions === "function") {
      try {
        const res = await ln.checkPermissions();
        const display = res && (res.display || res.receive);
        if (display === "granted") return true;
      } catch (_) {}
    }
    return requestPermission();
  }

  async function cancelRaid() {
    const ln = plugin();
    if (ln && typeof ln.cancel === "function") {
      try {
        await ln.cancel({ notifications: [{ id: RAID_ID }] });
      } catch (_) {}
    }
  }

  async function scheduleRaidEnd(raidTitle, endAtMs) {
    if (!enabled()) return { ok: false, reason: "disabled" };
    const when = Number(endAtMs);
    if (!Number.isFinite(when) || when <= Date.now() + 1500) {
      return { ok: false, reason: "too_soon" };
    }
    await cancelRaid();
    const okPerm = await ensurePermission();
    if (!okPerm && isNative()) return { ok: false, reason: "denied" };

    const title = "⚔️ Рейд: время вышло";
    const body = raidTitle
      ? `«${String(raidTitle).replace(/[«»]/g, "")}» — подтверди: Выполнить или Провалить`
      : "Подтверди результат рейда: Выполнить или Провалить";

    const ln = plugin();
    if (ln && typeof ln.schedule === "function") {
      try {
        // Channel (Android 8+)
        if (typeof ln.createChannel === "function") {
          try {
            await ln.createChannel({
              id: "raid",
              name: "Рейды",
              description: "Окончание таймера рейда",
              importance: 5,
              visibility: 1,
              sound: "default",
              vibration: true
            });
          } catch (_) {}
        }
        await ln.schedule({
          notifications: [{
            id: RAID_ID,
            title,
            body,
            channelId: "raid",
            schedule: { at: new Date(when), allowWhileIdle: true },
            extra: { type: "raid-expired" },
            iconColor: "#00ffaa"
          }]
        });
        return { ok: true, native: true };
      } catch (e) {
        console.warn("[Notifications] schedule failed", e);
      }
    }

    // Web Notification API cannot schedule for the future reliably when the page is closed.
    // Best-effort: if the tab is open near the deadline, updateRaidTimer still fires in-app.
    return { ok: false, reason: "no_native_scheduler" };
  }

  function wireActionOpenQuests() {
    const ln = plugin();
    if (!ln || typeof ln.addListener !== "function") return;
    try {
      ln.addListener("localNotificationActionPerformed", (event) => {
        try {
          const extra = event && event.notification && event.notification.extra;
          if (extra && extra.type === "raid-expired" && typeof switchTab === "function") {
            switchTab("quests");
          }
        } catch (_) {}
      });
    } catch (_) {}
  }

  async function init() {
    wireActionOpenQuests();
    if (!enabled()) return;
    // Soft permission ask only on native after first launch interaction is better;
    // still prepare channel early when possible.
    const ln = plugin();
    if (ln && typeof ln.createChannel === "function") {
      try {
        await ln.createChannel({
          id: "raid",
          name: "Рейды",
          description: "Окончание таймера рейда",
          importance: 5,
          visibility: 1
        });
      } catch (_) {}
    }
  }

  return {
    RAID_ID,
    enabled,
    init,
    requestPermission,
    ensurePermission,
    scheduleRaidEnd,
    cancelRaid
  };
})();

if (typeof window !== "undefined") window.Notifications = Notifications;
