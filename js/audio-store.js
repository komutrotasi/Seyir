/**
 * SEYİR — Yerel Ses ve Müzik Depolama & Oynatma Modülü (IndexedDB)
 * 
 * Tarayıcı tabanlı okul zili sesleri, İstiklal Marşı, Saygı Duruşu ve tören müziklerini
 * IndexedDB üzerinde güvenle saklar ve hem yönetim panelinde hem de dijital panoda
 * yüksek performansla çalar.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SeyirAudioStore = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const DB_NAME = 'seyir_audio_db';
    const DB_VERSION = 1;
    const STORE_NAME = 'audio_files';

    let dbInstance = null;
    let activeAudios = [];

    /**
     * IndexedDB veritabanı bağlantısını başlatır
     */
    function getDB() {
        return new Promise((resolve, reject) => {
            if (dbInstance) return resolve(dbInstance);

            const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            if (!indexedDB) {
                return reject(new Error('Bu tarayıcı IndexedDB depolamasını desteklemiyor.'));
            }

            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            req.onsuccess = function (e) {
                dbInstance = e.target.result;
                dbInstance.onversionchange = () => { dbInstance.close(); dbInstance = null; };
                resolve(dbInstance);
            };

            req.onerror = function (e) {
                reject(e.target.error || new Error('IndexedDB açılamadı'));
            };
        });
    }

    /**
     * Yerel ses dosyasını (File / Blob) IndexedDB'ye kaydeder
     * @param {string} id - Benzersiz ses kimliği (örn: 'zil_ogrenci_custom', 'muzik_123')
     * @param {File|Blob} file - Ses dosyası
     * @param {string} [customName] - İsteğe bağlı dosya adı
     */
    async function saveAudio(id, file, customName) {
        if (!id) throw new Error('Ses kimliği (id) zorunludur.');
        if (!(file instanceof Blob)) throw new Error('Kaydedilecek dosya bulunamadı.');
        if (file.size > window.SeyirDataPolicy.MAX_MEDIA) throw new Error('Medya 128 MB sınırını aşıyor.');
        if (file.type && !/^(audio|video)\/[a-z0-9.+-]+$/i.test(file.type)) throw new Error('Yalnızca ses ve video dosyası yüklenebilir.');
        window.seyirAssertMediaWrite?.();

        const db = await getDB();
        window.seyirAssertMediaWrite?.();
        const fileName = customName || file.name || 'ses_dosyasi';
        const fileType = file.type || 'audio/mpeg';
        const fileSize = file.size || 0;

        const record = {
            id: String(id),
            name: fileName,
            type: fileType,
            size: fileSize,
            blob: file,
            updatedAt: new Date().toISOString()
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            window.seyirMediaBusy?.(1);
            let failure;
            const all = store.getAll();
            all.onsuccess = () => {
                try {
                    window.seyirAssertMediaWrite?.();
                    const total = all.result.reduce((sum, item) => sum + (item.id === record.id ? 0 : item.blob.size), file.size);
                    if (total > window.SeyirDataPolicy.MAX_MEDIA) throw new Error('Yerel medya toplamı 128 MB sınırını aşıyor. Kullanılmayan dosyaları kaldırın.');
                    store.put(record);
                } catch (error) { failure = error; tx.abort(); }
            };
            tx.oncomplete = () => { window.seyirMediaBusy?.(-1); resolve(record); };
            tx.onabort = () => { window.seyirMediaBusy?.(-1); reject(failure || tx.error || new Error("Medya işlemi iptal edildi.")); };
        });
    }

    /**
     * ID'si verilen ses kaydını IndexedDB'den çeker
     */
    async function getAudio(id) {
        if (!id) return null;
        try {
            const db = await getDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.get(String(id));

                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => reject(req.error);
            });
        } catch (err) {
            console.warn('SeyirAudioStore.getAudio hatası:', err);
            return null;
        }
    }

    /**
     * ID'si verilen ses kaydını siler
     */
    async function deleteAudio(id) {
        window.seyirAssertMediaWrite?.();
        if (!id) return false;
        try {
            const db = await getDB();
            window.seyirAssertMediaWrite?.();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_NAME], 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                window.seyirAssertMediaDelete?.(String(id));
                const req = store.delete(String(id));

                tx.oncomplete = () => resolve(true);
                tx.onabort = () => reject(tx.error || new Error("Silme işlemi iptal edildi."));
                req.onerror = () => reject(req.error);
            });
        } catch (err) {
            console.warn('SeyirAudioStore.deleteAudio hatası:', err);
            return false;
        }
    }

    /**
     * Kaydedilmiş bir sesi doğrudan oynatır
     * @param {string} id - Ses kimliği
     * @param {number} [volumePercent=80] - 0-100 arası ses seviyesi
     * @param {Function} [onEnded] - Oynatma bittiğinde tetiklenecek fonksiyon
     * @returns {Promise<HTMLAudioElement|null>}
     */
    async function playAudio(id, volumePercent = 80, onEnded = null) {
        const item = await getAudio(id);
        if (window.seyirAssertMediaWrite) { try { window.seyirAssertMediaWrite(); } catch (_) { return null; } }
        if (!item || !item.blob) {
            console.warn(`SeyirAudioStore: "${id}" kimlikli ses dosyası bulunamadı.`);
            return null;
        }

        const objectUrl = URL.createObjectURL(item.blob);
        const audio = new Audio(objectUrl);
        const vol = Math.max(0.05, Math.min(1.0, (Number(volumePercent) || 80) / 100));
        audio.volume = vol;

        let cleaned = false;
        const cleanup = (notify = true) => {
            if (cleaned) return;
            cleaned = true;
            const idx = activeAudios.indexOf(audio);
            if (idx !== -1) activeAudios.splice(idx, 1);
            URL.revokeObjectURL(objectUrl);
            if (notify && typeof onEnded === 'function') {
                try { onEnded(); } catch (e) { console.error(e); }
            }
        };

        audio.seyirCleanup = cleanup;
        audio.addEventListener('ended', cleanup, { once: true });
        audio.addEventListener('error', (err) => {
            console.warn('Ses oynatma hatası:', err);
            cleanup();
        }, { once: true });

        activeAudios.push(audio);

        try {
            await audio.play();
            return audio;
        } catch (err) {
            console.warn('Tarayıcı otomatik ses oynatma politikası engeli:', err);
            cleanup();
            return null;
        }
    }

    /**
     * Şu anda çalmakta olan tüm sesleri anında durdurur
     */
    function stopAll() {
        if (Array.isArray(activeAudios)) {
            activeAudios.slice().forEach(a => {
                try {
                    a.pause();
                    a.currentTime = 0;
                    a.seyirCleanup(false);
                } catch (e) { }
            });
            activeAudios = [];
        }
    }

    /**
     * Dosya boyutunu okunabilir formata çevirir
     */
    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    async function listAll() {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const req = tx.objectStore(STORE_NAME).getAll();
            tx.oncomplete = () => resolve(req.result);
            tx.onabort = () => reject(tx.error);
        });
    }
    async function replaceAll(records, authorize = () => {}) {
        authorize();
        const total = records.reduce((sum, item) => sum + item.blob.size, 0);
        if (total > window.SeyirDataPolicy.MAX_MEDIA) throw new Error('Yerel medya toplamı 128 MB sınırını aşıyor.');
        const db = await getDB();
        authorize();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.clear();
            records.forEach(record => store.put(record));
            tx.oncomplete = () => resolve();
            tx.onabort = () => reject(tx.error || new Error('Medya işlemi geri alındı.'));
        });
    }
    async function clearAll() {
        stopAll();
        await replaceAll([]);
    }
    return {
        listAll, replaceAll, clearAll,
        saveAudio: saveAudio,
        getAudio: getAudio,
        deleteAudio: deleteAudio,
        playAudio: playAudio,
        stopAll: stopAll,
        formatBytes: formatBytes
    };
}));
