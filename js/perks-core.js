"use strict";


/*
 * Perks Core — game logic only.
 * No DOM, no rendering, no UI events.
 */
const PerksCore = (() => {
    const MAX_AVAILABLE = 3;
    const MAX_GENERATIONS_PER_LEVEL = 3;

    function ensureState() {
        if (!S().character || typeof S().character !== 'object') throw new Error('Character state is missing');
        if (!Array.isArray(S().perksUnlocked)) S().perksUnlocked = [];
        if (!Array.isArray(S().perksAvailable)) S().perksAvailable = [];
        if (!Number.isFinite(Number(S().character.perkGenLevel))) S().character.perkGenLevel = S().character.level || 1;
        if (!Number.isFinite(Number(S().character.perkGenCount))) S().character.perkGenCount = 0;
    }

    function syncGenerationLevel() {
        ensureState();
        const level = Math.max(1, Number(S().character.level) || 1);
        if (Number(S().character.perkGenLevel) !== level) {
            S().character.perkGenLevel = level;
            S().character.perkGenCount = 0;
            return true;
        }
        return false;
    }

    function resetGenerationForLevel(level = S().character.level) {
        ensureState();
        S().character.perkGenLevel = Math.max(1, Number(level) || 1);
        S().character.perkGenCount = 0;
    }

    function getGenerationCount() {
        ensureState();
        return Math.max(0, Number(S().character.perkGenCount) || 0);
    }

    function getGenerationLimit() {
        return MAX_GENERATIONS_PER_LEVEL;
    }

    function canGenerate() {
        syncGenerationLevel();
        return getGenerationCount() < MAX_GENERATIONS_PER_LEVEL;
    }

    function getAvailableLimit() {
        return MAX_AVAILABLE;
    }

    function addGenerated(perk, replaceIdx = null) {
        ensureState();
        if (!perk || typeof perk !== 'object') throw new Error('Invalid perk');
        if (!canGenerate()) return { ok: false, reason: 'generation_limit' };

        if (replaceIdx !== null && S().perksAvailable[replaceIdx] !== undefined) {
            S().perksAvailable[replaceIdx] = perk;
        } else {
            if (S().perksAvailable.length >= MAX_AVAILABLE) {
                return { ok: false, reason: 'available_limit' };
            }
            S().perksAvailable.push(perk);
        }

        S().character.perkGenCount = getGenerationCount() + 1;
        return { ok: true, count: S().character.perkGenCount };
    }

    function replaceAvailable(index, perk) {
        ensureState();
        if (!Number.isInteger(index) || index < 0 || index >= S().perksAvailable.length) return false;
        if (!perk || typeof perk !== 'object') return false;
        S().perksAvailable[index] = perk;
        return true;
    }

    function canUnlock(perk, conditionMet = true) {
        ensureState();
        if (!perk || typeof perk !== 'object') return { ok: false, reason: 'invalid_perk' };
        if (!conditionMet) return { ok: false, reason: 'condition' };
        const cost = Math.max(0, Number(perk.cost) || 0);
        if (getPerkPoints() < cost) return { ok: false, reason: 'points' };
        return { ok: true, cost };
    }

    function getPerkPoints() {
        ensureState();
        return Math.max(0, Number(S().character.perkPoints) || 0);
    }

    function unlock(index, conditionMet = true) {
        ensureState();
        if (!Number.isInteger(index) || index < 0 || index >= S().perksAvailable.length) {
            return { ok: false, reason: 'invalid_index' };
        }
        const perk = S().perksAvailable[index];
        const check = canUnlock(perk, conditionMet);
        if (!check.ok) return check;

        S().character.perkPoints -= check.cost;
        S().perksUnlocked.push({
            name: perk.name,
            effects: perk.effects || (perk.effect ? [perk.effect] : []),
            isSuper: !!perk.isSuper
        });
        S().perksAvailable.splice(index, 1);
        return { ok: true, perk };
    }

    return Object.freeze({
        MAX_AVAILABLE,
        MAX_GENERATIONS_PER_LEVEL,
        ensureState,
        syncGenerationLevel,
        resetGenerationForLevel,
        getGenerationCount,
        getGenerationLimit,
        canGenerate,
        getAvailableLimit,
        addGenerated,
        replaceAvailable,
        canUnlock,
        getPerkPoints,
        unlock
    });
})();
