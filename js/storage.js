"use strict";

/**
 * Platform-agnostic storage boundary — Stage 1 complete (v3.5.0).
 *
 * Contract:
 * - WebStorageAdapter  — synchronous primary for browser + compatibility fallback
 * - IndexedDBStorageAdapter — durable secondary mirror (verified writes)
 * - NativePreferencesStorageAdapter — durable primary on Capacitor/Android
 *
 * StorageService provides:
 *   save / load / remove / exists
 *   saveAsync / load paths with native preference
 *   IndexedDB mirror + compare + restore
 *   Native Preferences read/write
 *
 * Save format integrity, versioning, migrations, size limits and safety
 * backups live in js/save.js (SAVE_SCHEMA_VERSION, checksum, SAFETY_BACKUP_KEY).
 */

class WebStorageAdapter {
    constructor(storage = window.localStorage) {
        this.storage = storage;
    }

    getItem(key) { return this.storage.getItem(key); }
    setItem(key, value) { this.storage.setItem(key, value); }
    removeItem(key) { this.storage.removeItem(key); }
    hasItem(key) { return this.storage.getItem(key) !== null; }
}

class IndexedDBStorageAdapter {
    constructor({ dbName = 'the-creed-of-life', storeName = 'keyValue', version = 1 } = {}) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this._dbPromise = null;
    }

    isSupported() {
        return typeof window !== 'undefined' && !!window.indexedDB;
    }

    open() {
        if (!this.isSupported()) {
            return Promise.reject(new Error('IndexedDB API недоступен'));
        }
        if (this._dbPromise) return this._dbPromise;

        this._dbPromise = new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Не удалось открыть IndexedDB'));
            request.onblocked = () => reject(new Error('IndexedDB заблокирована другой вкладкой'));
        });

        return this._dbPromise;
    }

    async getItem(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const request = tx.objectStore(this.storeName).get(key);
            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error || new Error('IndexedDB read failed'));
        });
    }

    async setItem(key, value) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).put(value, key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
            tx.onabort = () => reject(tx.error || new Error('IndexedDB write aborted'));
        });
    }

    async removeItem(key) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            tx.objectStore(this.storeName).delete(key);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error || new Error('IndexedDB delete failed'));
            tx.onabort = () => reject(tx.error || new Error('IndexedDB delete aborted'));
        });
    }

    async hasItem(key) {
        const value = await this.getItem(key);
        return value !== null && value !== undefined;
    }
}

class NativePreferencesStorageAdapter {
    constructor() {
        this.preferences = null;
        this.ready = false;
        this.error = null;
    }

    isSupported() {
        return !!(typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences);
    }

    async initialize() {
        if (!this.isSupported()) return false;
        this.preferences = window.Capacitor.Plugins.Preferences;
        this.ready = true;
        this.error = null;
        return true;
    }

    async getItem(key) {
        if (!this.ready && !(await this.initialize())) return null;
        const result = await this.preferences.get({ key });
        return result && typeof result.value === 'string' ? result.value : null;
    }

    async setItem(key, value) {
        if (!this.ready && !(await this.initialize())) throw new Error('Capacitor Preferences недоступен');
        await this.preferences.set({ key, value: String(value) });
        return true;
    }

    async removeItem(key) {
        if (!this.ready && !(await this.initialize())) throw new Error('Capacitor Preferences недоступен');
        await this.preferences.remove({ key });
        return true;
    }

    async hasItem(key) {
        return (await this.getItem(key)) !== null;
    }
}

function createStorageAdapter() {
    if (typeof window === 'undefined' || !window.localStorage) {
        throw new Error('Web Storage API недоступен');
    }
    return new WebStorageAdapter(window.localStorage);
}

const StorageService = (() => {
    let adapter = null;
    let indexedDBAdapter = null;
    let indexedDBReady = false;
    let indexedDBError = null;
    // Serialize all IndexedDB mutations so rapid autosaves cannot complete
    // out of order and leave the mirror older than the latest local save.
    let indexedDBWriteChain = Promise.resolve();
    let nativeAdapter = null;
    let nativeReady = false;
    let nativeError = null;

    function getNativeAdapter() {
        if (!nativeAdapter) nativeAdapter = new NativePreferencesStorageAdapter();
        return nativeAdapter;
    }

    async function initializeNative() {
        try {
            nativeReady = await getNativeAdapter().initialize();
            nativeError = null;
            return nativeReady;
        } catch (error) {
            nativeReady = false;
            nativeError = error;
            console.warn('Native Preferences initialization failed:', error);
            return false;
        }
    }

    function getAdapter() {
        if (!adapter) adapter = createStorageAdapter();
        return adapter;
    }

    function getIndexedDBAdapter() {
        if (!indexedDBAdapter) indexedDBAdapter = new IndexedDBStorageAdapter();
        return indexedDBAdapter;
    }

    async function mirrorToIndexedDBAndWait(key, value) {
        const idb = getIndexedDBAdapter();
        await idb.setItem(key, value);
        const verified = await idb.getItem(key);
        if (verified !== value) throw new Error('IndexedDB verification failed');
        indexedDBReady = true;
        indexedDBError = null;
        return true;
    }

    function mirrorToIndexedDB(key, value) {
        const idb = getIndexedDBAdapter();
        indexedDBWriteChain = indexedDBWriteChain
            .catch(() => {})
            .then(() => idb.setItem(key, value))
            .then(() => { indexedDBReady = true; indexedDBError = null; })
            .catch(error => {
                indexedDBError = error;
                console.warn('IndexedDB mirror failed:', error);
            });
    }

    function mirrorRemoveFromIndexedDB(key) {
        const idb = getIndexedDBAdapter();
        indexedDBWriteChain = indexedDBWriteChain
            .catch(() => {})
            .then(() => idb.removeItem(key))
            .then(() => { indexedDBReady = true; indexedDBError = null; })
            .catch(error => {
                indexedDBError = error;
                console.warn('IndexedDB mirror remove failed:', error);
            });
    }

    async function initializeIndexedDB(key) {
        const idb = getIndexedDBAdapter();
        if (!idb.isSupported()) {
            indexedDBError = new Error('IndexedDB API недоступен');
            return false;
        }

        try {
            await idb.open();
            const localValue = getAdapter().getItem(key);
            const indexedValue = await idb.getItem(key);

            // localStorage remains authoritative. Only an empty IndexedDB
            // record is seeded automatically. If both records exist but
            // differ, do not overwrite either one: leave the discrepancy for
            // the diagnostic/recovery layer to handle explicitly.
            if (localValue !== null && (indexedValue === null || indexedValue === undefined)) {
                await idb.setItem(key, localValue);
            }

            indexedDBReady = true;
            indexedDBError = null;
            return true;
        } catch (error) {
            indexedDBError = error;
            console.warn('IndexedDB initialization failed:', error);
            return false;
        }
    }

    return Object.freeze({
        save(key, value) {
            // Fast compatibility path. Critical operations use saveAsync(),
            // which waits for the durable backend and verifies the write.
            getAdapter().setItem(key, value);
            if (getNativeAdapter().isSupported()) {
                getNativeAdapter().setItem(key, value).then(() => {
                    nativeReady = true;
                    nativeError = null;
                }).catch(error => {
                    nativeError = error;
                    console.warn('Native Preferences write failed:', error);
                });
            } else {
                mirrorToIndexedDB(key, value);
            }
            return true;
        },

        async saveAsync(key, value) {
            if (typeof value !== 'string') throw new TypeError('StorageService.saveAsync expects a string');

            if (getNativeAdapter().isSupported()) {
                await getNativeAdapter().setItem(key, value);
                nativeReady = true;
                nativeError = null;
                const verified = await getNativeAdapter().getItem(key);
                if (verified !== value) throw new Error('Native Preferences verification failed');
                getAdapter().setItem(key, value);
                return true;
            }

            getAdapter().setItem(key, value);
            const idb = getIndexedDBAdapter();
            if (idb.isSupported()) {
                await mirrorToIndexedDBAndWait(key, value);
            }
            return true;
        },

        load(key) {
            return getAdapter().getItem(key);
        },

        // Synchronous fallback write used only to keep localStorage aligned
        // with the IndexedDB record selected during startup. It does not
        // trigger another IndexedDB mirror write.
        setLocalOnly(key, value) {
            getAdapter().setItem(key, value);
        },

        remove(key) {
            getAdapter().removeItem(key);
            if (getNativeAdapter().isSupported()) {
                getNativeAdapter().removeItem(key).catch(error => console.warn('Native Preferences remove failed:', error));
            }
            mirrorRemoveFromIndexedDB(key);
            return true;
        },

        async removeAsync(key) {
            if (getNativeAdapter().isSupported()) {
                await getNativeAdapter().removeItem(key);
                const remaining = await getNativeAdapter().getItem(key);
                if (remaining !== null) throw new Error('Native Preferences remove verification failed');
                getAdapter().removeItem(key);
                return true;
            }
            getAdapter().removeItem(key);
            if (getIndexedDBAdapter().isSupported()) {
                await getIndexedDBAdapter().removeItem(key);
            }
            return true;
        },

        exists(key) {
            return getAdapter().hasItem(key);
        },

        initializeIndexedDB,

        async readIndexedDB(key) {
            try {
                const value = await getIndexedDBAdapter().getItem(key);
                indexedDBReady = true;
                indexedDBError = null;
                return value;
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB read failed:', error);
                return null;
            }
        },

        async compareIndexedDB(key) {
            try {
                const localValue = getAdapter().getItem(key);
                const indexedValue = await getIndexedDBAdapter().getItem(key);
                indexedDBReady = true;
                indexedDBError = null;
                return {
                    localExists: localValue !== null,
                    indexedExists: indexedValue !== null && indexedValue !== undefined,
                    matches: localValue === indexedValue,
                    localValue,
                    indexedValue
                };
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB comparison failed:', error);
                return {
                    localExists: getAdapter().getItem(key) !== null,
                    indexedExists: false,
                    matches: false,
                    localValue: getAdapter().getItem(key),
                    indexedValue: null,
                    error: error.message || String(error)
                };
            }
        },

        async restoreFromIndexedDB(key) {
            try {
                const indexedValue = await getIndexedDBAdapter().getItem(key);
                if (indexedValue === null || indexedValue === undefined) {
                    return { restored: false, reason: 'empty' };
                }
                getAdapter().setItem(key, indexedValue);
                indexedDBReady = true;
                indexedDBError = null;
                return { restored: true, value: indexedValue };
            } catch (error) {
                indexedDBError = error;
                console.warn('IndexedDB restore failed:', error);
                return { restored: false, reason: 'error', error: error.message || String(error) };
            }
        },

        async initializeNative() { return initializeNative(); },

        async readNative(key) {
            try {
                const value = await getNativeAdapter().getItem(key);
                nativeReady = true;
                nativeError = null;
                return value;
            } catch (error) {
                nativeError = error;
                nativeReady = false;
                console.warn('Native Preferences read failed:', error);
                return null;
            }
        },

        nativeStatus() {
            return {
                supported: getNativeAdapter().isSupported(),
                ready: nativeReady,
                error: nativeError ? String(nativeError.message || nativeError) : null
            };
        },

        indexedDBStatus() {
            return {
                supported: getIndexedDBAdapter().isSupported(),
                ready: indexedDBReady,
                error: indexedDBError ? String(indexedDBError.message || indexedDBError) : null
            };
        }
    });
})();
