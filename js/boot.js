"use strict";

/* Boot splash — dense/fast terminal sequence */

const BootSplash = (() => {
  let finished = false;
  let sequenceTimer = null;
  let resolveRun = null;

  // ~3× more lines than v3.7.3 (9 → 27)
  const LINES = [
    { t: "> TCoL kernel entry 0x7C00 …", cls: "is-dim" },
    { t: "> POST memcheck  … 128M ok", cls: "is-ok" },
    { t: "> irq table remap … ok", cls: "is-ok" },
    { t: "> fs://localStorage mount … ok", cls: "is-ok" },
    { t: "> fs://indexedDB mount … ok", cls: "is-ok" },
    { t: "> native Preferences bridge … probe", cls: "is-dim" },
    { t: "> save envelope schema v2 … checksum", cls: "is-ok" },
    { t: "> migration chain … idle", cls: "is-dim" },
    { t: "> safety backup slot … ready", cls: "is-ok" },
    { t: "> GameState root … bind", cls: "is-ok" },
    { t: "> character profile … load", cls: "is-ok" },
    { t: "> SPECIAL/skills/perks … hydrate", cls: "is-ok" },
    { t: "> quest runtime … online", cls: "is-ok" },
    { t: "> raid timer service … standby", cls: "is-dim" },
    { t: "> boss registry … indexed", cls: "is-ok" },
    { t: "> inventory/equipment mesh … ok", cls: "is-ok" },
    { t: "> craft pipeline … ok", cls: "is-ok" },
    { t: "> economy ticks … armed", cls: "is-ok" },
    { t: "> achievement bus … listen", cls: "is-ok" },
    { t: "> journal writer … open", cls: "is-ok" },
    { t: "> AudioContext link … ready", cls: "is-ok" },
    { t: "> LocalNotifications channel … raid", cls: "is-dim" },
    { t: "> UI shell / bottom-nav … calibrated", cls: "is-ok" },
    { t: "> theme tokens … phosphor", cls: "is-ok" },
    { t: "> offline cache … available", cls: "is-ok" },
    { t: "> AI gateway … deferred", cls: "is-dim" },
    { t: "> watchdog … green", cls: "is-ok" }
  ];

  function el(id){ return document.getElementById(id); }

  function playBootSound() {
    try {
      if (typeof Sound !== "undefined") {
        Sound.unlock();
        Sound.boot();
      }
    } catch (_) {}
  }

  function appendLine(text, cls) {
    const log = el("bootTerminalLog");
    if (!log) return null;
    log.querySelectorAll(".boot-log-cursor").forEach((n) => n.classList.remove("boot-log-cursor"));
    const line = document.createElement("div");
    line.className = "boot-log-line" + (cls ? " " + cls : "") + " boot-log-cursor";
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    return line;
  }

  function typeTitle(done) {
    const out = el("bootTcolOut");
    if (!out) { done(); return; }
    out.innerHTML = "";
    const text = "The Creed of Life";
    [...text].forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "boot-char";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = (i * 0.035) + "s";
      out.appendChild(span);
    });
    setTimeout(done, 35 * text.length + 650);
  }

  function hide() {
    if (finished) return;
    finished = true;
    if (sequenceTimer) {
      clearTimeout(sequenceTimer);
      sequenceTimer = null;
    }
    const splash = el("bootSplash");
    if (!splash) {
      if (resolveRun) resolveRun();
      return;
    }
    splash.classList.add("is-done");
    splash.setAttribute("aria-hidden", "true");
    setTimeout(() => {
      try { splash.remove(); } catch (_) {}
      if (resolveRun) resolveRun();
    }, 520);
  }

  function runSequence() {
    const log = el("bootTerminalLog");
    if (!log) {
      hide();
      return;
    }
    let i = 0;
    // 3× faster than 320ms → ~107ms
    const stepMs = 107;

    function next() {
      if (finished) return;
      if (i < LINES.length) {
        appendLine(LINES[i].t, LINES[i].cls);
        i += 1;
        sequenceTimer = setTimeout(next, stepMs);
        return;
      }
      const finale = el("bootTerminalFinale");
      if (finale) finale.hidden = false;
      log.querySelectorAll(".boot-log-cursor").forEach((n) => n.classList.remove("boot-log-cursor"));
      try { if (typeof Sound !== "undefined") Sound.success(); } catch (_) {}
      sequenceTimer = setTimeout(() => {
        typeTitle(() => {
          sequenceTimer = setTimeout(hide, 600);
        });
      }, 200);
    }
    next();
  }

  function run() {
    const splash = el("bootSplash");
    if (!splash) return Promise.resolve();
    finished = false;
    playBootSound();
    const once = () => {
      playBootSound();
      document.removeEventListener("pointerdown", once, true);
      document.removeEventListener("touchstart", once, true);
    };
    document.addEventListener("pointerdown", once, true);
    document.addEventListener("touchstart", once, true);

    return new Promise((resolve) => {
      resolveRun = resolve;
      sequenceTimer = setTimeout(runSequence, 120);
      setTimeout(() => {
        if (!finished) hide();
      }, 10000);
    });
  }

  function done() {}
  function setProgress(){}

  return { run, done, hide, setProgress };
})();

if (typeof window !== "undefined") window.BootSplash = BootSplash;
