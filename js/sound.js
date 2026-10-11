"use strict";

/* Sound — Web Audio SFX (no external files). Offline-safe. */

const Sound = (() => {
  let ctx = null;
  let master = null;
  let unlocked = false;

  function enabled() {
    try {
      if (typeof state !== "undefined" && state && state.settings && state.settings.soundEnabled === false) return false;
    } catch (_) {}
    return true;
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 3.96; // ~18× vs first ship (0.22); ×2 vs v3.6.8
    master.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = ensureCtx();
    if (!c) return;
    if (c.state === "suspended") {
      c.resume().catch(() => {});
    }
    unlocked = true;
  }

  function tone({ freq = 440, type = "sine", start = 0, dur = 0.12, peak = 0.12, attack = 0.01, release = null }) {
    const c = ensureCtx();
    if (!c || !master || !enabled()) return;
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    const rel = release != null ? release : Math.max(0.02, dur * 0.55);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(attack + 0.01, dur));
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  function chord(freqs, opts = {}) {
    freqs.forEach((f, i) => {
      tone({
        freq: f,
        type: opts.type || "sine",
        start: (opts.stagger || 0) * i,
        dur: opts.dur || 0.28,
        peak: (opts.peak || 0.055) * (1 - i * 0.08),
        attack: opts.attack || 0.02
      });
    });
  }

  const SFX = {
    ui() {
      tone({ freq: 720, type: "triangle", dur: 0.06, peak: 0.035, attack: 0.005 });
    },
    tab() {
      tone({ freq: 520, type: "triangle", dur: 0.07, peak: 0.04, attack: 0.008 });
      tone({ freq: 780, type: "sine", start: 0.03, dur: 0.05, peak: 0.025, attack: 0.005 });
    },
    success() {
      tone({ freq: 523.25, type: "sine", dur: 0.12, peak: 0.06 });
      tone({ freq: 659.25, type: "sine", start: 0.09, dur: 0.16, peak: 0.055 });
      tone({ freq: 783.99, type: "triangle", start: 0.18, dur: 0.2, peak: 0.045 });
    },
    fail() {
      tone({ freq: 320, type: "sawtooth", dur: 0.14, peak: 0.03, attack: 0.01 });
      tone({ freq: 220, type: "triangle", start: 0.1, dur: 0.22, peak: 0.04 });
    },
    levelup() {
      chord([261.63, 329.63, 392.0, 523.25], { stagger: 0.1, dur: 0.36, peak: 0.07, type: "triangle" });
      tone({ freq: 659.25, type: "sine", start: 0.42, dur: 0.35, peak: 0.05 });
    },
    achievement(isMaxRank) {
      if (isMaxRank) {
        chord([261.63, 329.63, 392.0, 523.25, 659.25], { stagger: 0.11, dur: 0.38, peak: 0.07, type: "triangle" });
      } else {
        chord([392.0, 493.88, 587.33], { stagger: 0.1, dur: 0.3, peak: 0.055, type: "sine" });
      }
    },
    raidStart() {
      tone({ freq: 110, type: "square", dur: 0.18, peak: 0.03, attack: 0.02 });
      tone({ freq: 165, type: "triangle", start: 0.12, dur: 0.22, peak: 0.04 });
      tone({ freq: 220, type: "sine", start: 0.28, dur: 0.28, peak: 0.035 });
    },
    raidWarn() {
      tone({ freq: 440, type: "square", dur: 0.1, peak: 0.04 });
      tone({ freq: 440, type: "square", start: 0.16, dur: 0.1, peak: 0.035 });
    },
    quest() {
      SFX.success();
    },
    equip() {
      tone({ freq: 880, type: "triangle", dur: 0.08, peak: 0.04, attack: 0.005 });
      tone({ freq: 1320, type: "sine", start: 0.05, dur: 0.12, peak: 0.03 });
    },
    consumable() {
      tone({ freq: 600, type: "sine", dur: 0.1, peak: 0.04 });
      tone({ freq: 900, type: "triangle", start: 0.08, dur: 0.14, peak: 0.035 });
    },
    boss() {
      chord([196.0, 246.94, 293.66, 392.0], { stagger: 0.12, dur: 0.4, peak: 0.06, type: "triangle" });
    },
    toggleOn() {
      tone({ freq: 480, type: "sine", dur: 0.08, peak: 0.05 });
      tone({ freq: 720, type: "sine", start: 0.07, dur: 0.1, peak: 0.04 });
    },
    toggleOff() {
      tone({ freq: 400, type: "triangle", dur: 0.1, peak: 0.035 });
    },
    boot() {
      // CRT power-on + reticle lock
      tone({ freq: 80, type: "sawtooth", dur: 0.22, peak: 0.08, attack: 0.03 });
      tone({ freq: 160, type: "square", start: 0.12, dur: 0.16, peak: 0.05 });
      tone({ freq: 330, type: "triangle", start: 0.28, dur: 0.18, peak: 0.06 });
      tone({ freq: 523.25, type: "sine", start: 0.48, dur: 0.22, peak: 0.07 });
      tone({ freq: 659.25, type: "sine", start: 0.62, dur: 0.28, peak: 0.055 });
      tone({ freq: 784, type: "triangle", start: 0.9, dur: 0.35, peak: 0.04 });
    }
  };

  function play(name, arg) {
    if (!enabled() && name !== "toggleOn") return;
    unlock();
    const fn = SFX[name];
    if (typeof fn === "function") {
      try { fn(arg); } catch (_) {}
    }
  }

  function installUnlockListeners() {
    const once = () => {
      unlock();
      document.removeEventListener("pointerdown", once, true);
      document.removeEventListener("touchstart", once, true);
      document.removeEventListener("keydown", once, true);
    };
    document.addEventListener("pointerdown", once, true);
    document.addEventListener("touchstart", once, true);
    document.addEventListener("keydown", once, true);
  }

  return {
    play,
    unlock,
    enabled,
    installUnlockListeners,
    // named helpers
    ui: () => play("ui"),
    tab: () => play("tab"),
    success: () => play("success"),
    fail: () => play("fail"),
    levelup: () => play("levelup"),
    achievement: (max) => play("achievement", max),
    raidStart: () => play("raidStart"),
    raidWarn: () => play("raidWarn"),
    quest: () => play("quest"),
    equip: () => play("equip"),
    consumable: () => play("consumable"),
    boss: () => play("boss"),
    boot: () => play("boot")
  };
})();

if (typeof window !== "undefined") {
  window.Sound = Sound;
}
