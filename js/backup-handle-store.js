/**
 * Seyir — File System Access API klasör iznini sayfa yenilemeleri arasında saklar.
 * Klasör kolu yalnızca cihazdaki IndexedDB alanında tutulur; sunucuya gönderilmez.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SeyirBackupHandleStore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DB_NAME = 'seyir_settings_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'settings';
    const DIRECTORY_KEY = 'backup-directory';

    function openDB() {
        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                reject(new Error('Bu tarayıcı kalıcı klasör seçimini desteklemiyor.'));
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Klasör bilgisi deposu açılamadı.'));
        });
    }

    async function transact(mode, operation) {
        const db = await openDB();
        try {
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, mode);
                const request = operation(tx.objectStore(STORE_NAME));
                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error || new Error('Klasör bilgisi işlemi başarısız.'));
                tx.onabort = () => reject(tx.error || new Error('Klasör bilgisi işlemi iptal edildi.'));
            });
        } finally {
            db.close();
        }
    }

    return Object.freeze({
        get: () => transact('readonly', store => store.get(DIRECTORY_KEY)),
        save: handle => transact('readwrite', store => store.put(handle, DIRECTORY_KEY)),
        clear: () => transact('readwrite', store => store.delete(DIRECTORY_KEY)).catch(() => null)
    });
}));
