"use strict";

/**
 * Game State boundary.
 *
 * Stage 2.2: the game state now has one explicit owner/API. Existing systems
 * still use the legacy `state` binding for backward compatibility, but all
 * replacement of the root state goes through GameState.replace(). This lets
 * us migrate modules incrementally without changing save format or gameplay.
 */
const GameState = (() => {
    let current = null;

    function syncLegacyBinding(next) {
        // `state` remains a compatibility binding for the current modular
        // codebase. It is intentionally synchronized only at the root level.
        state = next;
        current = next;
    }

    return Object.freeze({
        initialize(initialState) {
            if (!initialState || typeof initialState !== 'object') {
                throw new TypeError('GameState.initialize expects an object');
            }
            syncLegacyBinding(initialState);
            return current;
        },

        replace(nextState) {
            if (!nextState || typeof nextState !== 'object') {
                throw new TypeError('GameState.replace expects an object');
            }
            syncLegacyBinding(nextState);
            return current;
        },

        get() {
            return current;
        },

        hasState() {
            return !!current;
        },

        /**
         * Return the live state root. Cores must use this instead of the
         * legacy global `state` binding. Mutating the returned object is
         * intentional: GameState owns the same reference.
         */
        require() {
            if (current) return current;
            // Boot fallback: some early paths may run before initialize().
            if (typeof state !== 'undefined' && state && typeof state === 'object') {
                current = state;
                return current;
            }
            throw new Error('GameState is not initialized');
        },

        snapshot() {
            if (!current) return null;
            try {
                return structuredClone(current);
            } catch (_) {
                return JSON.parse(JSON.stringify(current));
            }
        }
    });
})();

/**
 * Convenience accessor for Game Core modules.
 * Prefer S() / GameState.require() over the legacy global `state` binding.
 * Mutating the returned object is intentional — GameState owns that reference.
 */
function S() {
    return GameState.require();
}

