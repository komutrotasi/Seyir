/* Tam yerel yedek: yapılandırma + başvurulan medya, SHA-256 bütünlük kontrolü. */
(function () {
    'use strict';
    const MAX_MEDIA = SeyirDataPolicy.MAX_MEDIA;
    function references(data) {
        const ids = new Set();
        function visit(v) {
            if (!v || typeof v !== 'object') return;
            for (const [key, value] of Object.entries(v)) {
                if (key === 'yedekGecmisi' || key === 'gecmis') continue;
                if (['mediaId', 'audioId', 'customAudioId'].includes(key) && value) ids.add(String(value));
                if (/^customAudio(Ogrenci|Ogretmen|Cikis)$/.test(key) && value && value.id) ids.add(String(value.id));
                visit(value);
            }
        }
        visit(data);
        const z = data.zilYonetimi || {};
        for (const [field, id] of [['melodiOgrenci','zil_ogrenci_custom'],['melodiOgretmen','zil_ogretmen_custom'],['melodiCikis','zil_cikis_custom']]) if (z[field] === 'custom') ids.add(z['customAudio' + field.slice(6)]?.id || id);
        return [...ids];
    }
    async function hash(bytes) {
        return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2,'0')).join('');
    }
    function encode(bytes) {
        let str = '';
        for (let i = 0; i < bytes.length; i += 16384) str += String.fromCharCode(...bytes.subarray(i, i + 16384));
        return btoa(str);
    }
    async function create(data) {
        const veri = SeyirDataPolicy.validate(data);
        delete veri.yedekGecmisi;
        const medya = []; let total = 0;
        for (const id of references(veri)) {
            const item = await SeyirAudioStore.getAudio(id);
            if (!item || !item.blob) throw new Error('Yedeklenemeyen medya: ' + id + '. Dosyayı yeniden yükleyin veya kaydını kaldırın.');
            total += item.blob.size;
            if (total > MAX_MEDIA) throw new Error('Yedek medyası 128 MB sınırını aşıyor.');
            const bytes = new Uint8Array(await item.blob.arrayBuffer());
            medya.push({id, name:item.name, type:item.type, size:bytes.length, sha256:await hash(bytes), data:encode(bytes)});
        }
        return {_meta:{tur:'seyir-full-backup',surum:2,olusturmaZamani:new Date().toISOString(),kisiselVeriIcerir:true},veri,medya};
    }
    async function prepare(input) {
        const full = input && input._meta && input._meta.tur === 'seyir-full-backup';
        if (full && input._meta.surum !== 2) throw new Error('Desteklenmeyen tam yedek sürümü.');
        const raw = full ? input.veri : input;
        if (JSON.stringify(raw).length > 5 * 1024 * 1024) throw new Error('Yapılandırma 5 MB sınırını aşıyor.');
        const data = SeyirDataPolicy.validate(raw);
        // Geçmiş veri taşınmaz: eski kişisel kayıtlar saklama süresini aşamaz.
        data.yedekGecmisi = [];
        const records = []; const ids = new Set(); let total = 0;
        if (full) {
            if (!Array.isArray(input.medya) || input.medya.length > 1000) throw new Error('Geçersiz medya listesi.');
            for (const m of input.medya) {
                if (!m || typeof m.id !== 'string' || !m.id || m.id.length > 200 || ids.has(m.id) || typeof m.name !== 'string' || typeof m.type !== 'string' || !/^(audio|video)\/[a-z0-9.+-]+$/i.test(m.type) || !Number.isInteger(m.size) || m.size < 0 || typeof m.data !== 'string' || !/^[a-f0-9]{64}$/.test(m.sha256)) throw new Error('Geçersiz medya kaydı.');
                total += m.size;
                if (total > MAX_MEDIA || m.data.length > Math.ceil(m.size / 3) * 4) throw new Error('Medya boyutu sınırı/geçersiz boyut.');
                const bytes = Uint8Array.from(atob(m.data), c => c.charCodeAt(0));
                if (bytes.length !== m.size || await hash(bytes) !== m.sha256) throw new Error('Medya bütünlük kontrolü başarısız: ' + m.id);
                ids.add(m.id);
                records.push({id:m.id,name:m.name,type:m.type,size:m.size,blob:new Blob([bytes],{type:m.type}),updatedAt:new Date().toISOString()});
            }
        }
        const needed = references(data);
        for (const id of needed) {
            if (full ? !ids.has(id) : !(await SeyirAudioStore.getAudio(id))) throw new Error('Yedekte veya cihazda medya eksik: ' + id);
        }
        if (full && [...ids].some(id => !needed.includes(id))) throw new Error('Yedekte başvurulmayan medya var.');
        return {data, records};
    }
    // İki localStorage anahtarı tek işlem değildir. Yayın son adımdır; hata halinde eski özel kayıt geri yüklenir.
    function commit(privateData, publicData) {
        const key = 'seyir_admin_data', pub = 'seyir_public_data';
        const old = localStorage.getItem(key);
        const a = JSON.stringify(privateData), b = JSON.stringify(publicData);
        if ((a.length + b.length) * 2 > 4 * 1024 * 1024) throw new Error('Yerel kayıt 4 MB sınırını aşıyor. Eski anlık görüntüleri veya büyük görselleri azaltın.');
        let written = false;
        try {
            localStorage.setItem(key, a); written = true;
            localStorage.setItem(pub, b);
        } catch (error) {
            if (written) { localStorage.removeItem(key); if (old !== null) localStorage.setItem(key, old); }
            throw new Error('Kayıt tamamlanamadı; önceki kayıt korundu. ' + error.message);
        }
    }
    window.SeyirBackup = {create, prepare, references, commit};
})();
