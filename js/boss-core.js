"use strict";


// Pure game logic for bosses. No DOM, rendering, animation or persistence.
const BossCore = (() => {
  function getActiveBoss() {
    return S().bosses.find(b => b.id === S().activeBossId) || null;
  }

  function currentPhase(boss) {
    return boss && Array.isArray(boss.phases) ? boss.phases.find(p => !p.defeated) || null : null;
  }

  function totalProgress(boss) {
    return (boss?.phases || []).reduce((sum, p) => sum + Math.min(Number(p.progress) || 0, Number(p.target) || 0), 0);
  }

  function hpPercent(boss) {
    if (!boss || !boss.target) return 0;
    return Math.min(100, Math.max(0, (boss.target - totalProgress(boss)) / boss.target * 100));
  }

  function phasePercent(phase) {
    if (!phase || !phase.target) return 0;
    return Math.min(100, Math.max(0, phase.progress / phase.target * 100));
  }

  function create(boss) {
    if (!boss || typeof boss !== 'object') return null;
    if (!Array.isArray(S().bosses)) S().bosses = [];
    S().bosses.push(boss);
    S().activeBossId = boss.id;
    return boss;
  }

  function setActive(index) {
    const boss = S().bosses[index];
    if (!boss) return null;
    S().activeBossId = boss.id;
    return boss;
  }

  function remove(index) {
    if (index < 0 || index >= S().bosses.length) return null;
    const boss = S().bosses[index];
    S().bosses.splice(index, 1);
    if (S().activeBossId === boss.id) {
      S().activeBossId = S().bosses.length ? S().bosses[0].id : null;
    }
    return boss;
  }

  function heal(boss, amount) {
    if (!boss || boss.bossType === 'other') return { ok:false, message:'Этот тип босса нельзя отхилить' };
    const phase = currentPhase(boss);
    if (!phase) return { ok:false, message:'У босса нет активной фазы' };
    const available = Math.min(Math.max(0, Number(phase.progress) || 0), Math.max(0, Number(S().cushion) || 0));
    if (available <= 0) return { ok:false, message:'В текущей фазе нет накопленного прогресса для отхила' };
    const healAmount = Math.min(Math.floor(Number(amount) || 0), available);
    if (healAmount <= 0) return { ok:false, message:'Укажи корректную сумму' };
    phase.progress -= healAmount;
    S().cushion -= healAmount;
    return { ok:true, amount:healAmount, phase, hpPercent:hpPercent(boss), phasePercent:phasePercent(phase) };
  }

  function damage(boss, amount) {
    const numeric = Math.floor(Number(amount) || 0);
    if (!boss) return { ok:false, message:'Босс не найден' };
    if (numeric <= 0) return { ok:false, message:'Укажи корректную сумму' };
    const before = currentPhase(boss);
    if (!before) return { ok:false, message:'У босса нет активной фазы' };

    const beforeHpPct = hpPercent(boss);
    const beforePhasePct = phasePercent(before);
    let remaining = numeric;
    if (boss.bossType !== 'other') S().cushion = (Number(S().cushion) || 0) + numeric;
    const defeatedThisHit = [];

    while (remaining > 0) {
      const phase = currentPhase(boss);
      if (!phase) break;
      const need = Math.max(0, phase.target - phase.progress);
      const take = Math.min(need, remaining);
      phase.progress += take;
      remaining -= take;
      if (phase.progress >= phase.target && !phase.defeated && !phase.applied) {
        phase.defeated = true;
        if (typeof applyReward === 'function') applyReward(phase.reward, phase.name + ' побеждена');
        phase.applied = true;
        defeatedThisHit.push(phase);
      }
    }

    const defeated = boss.phases.every(p => p.defeated);
    if (defeated && !boss.victoryRewarded) boss.victoryPending = true;
    const afterPhase = currentPhase(boss);
    return {
      ok:true,
      requested:numeric,
      appliedDamage:numeric - remaining,
      defeated,
      defeatedThisHit,
      beforeHpPct,
      beforePhasePct,
      afterHpPct:hpPercent(boss),
      afterPhasePct:phasePercent(afterPhase),
      events: defeatedThisHit.map(phase => ({ type:'boss', icon:'👹', text:`${boss.name}: ${phase.name} побеждена` }))
    };
  }

  return { getActiveBoss, currentPhase, totalProgress, hpPercent, phasePercent, create, setActive, remove, heal, damage };
})();
