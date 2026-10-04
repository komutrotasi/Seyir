/* Seyir veri sınırı: yalnızca tanımlı alanlar açık panoya geçebilir. */
(function (root) {
    'use strict';
    const fields = names => Object.fromEntries(names.split(' ').map(name => [name, true]));
    const lesson = fields('ders saat hoca ogretmen type');
    const privacy = fields('personelAdiGosterim nobetciGoster rehberOgretmenGoster dersOgretmeniGoster saklamaSuresiGun');
    const schedule = fields('ders saat');
    const bell = fields('id saat tur baslik melodi sure anons aktif customAudioId customAudioName');
    const ceremony = { ...fields('id saat baslik audioId dosyaAdi dosyaBoyut sesSeviyesi torenModu aktif'), gunler: [true] };
    const publicSchema = {
        ...fields('okulAdi okulTuru okulLogo okulWebSiteUrl slogan'),
        daktiloYazilari: [true], fotograflar: [true], kayanYazi: [true],
        konum: fields('sehir ilce enlem boylam'), gizlilik: privacy,
        ayarlar: {
            ...fields('karuselSuresi temaOtomatik daktiloHiz daktiloBekleme tickerDurum tickerBaslik tickerHiz tickerAyrac'),
            screensaver: fields('aktif mesaiBitis mesaiBaslangic boslukDakika haftasonuUyku')
        },
        duyurular: [fields('id baslik icerik tarih renk oncelik tip aktif')],
        sinavlar: [fields('id ders siniflar tarih saat dersSaati tur')],
        mebHaberler: [fields('tip baslik gorsel link tarih icerik renk')],
        karuselVideolar: [fields('id tur baslik url mediaId youtubeId sure otomatikGec sesli altyaziKapat dongu aktif dosyaAdi dosyaBoyut')],
        dersProgrami: [schedule], dersProgramiLise: [schedule], dersProgramiOrtaokul: [schedule],
        dersProgramiDetay: { '*': { '*': [lesson] } },
        nobetciOgretmenler: [true], nobetciGunluk: { '*': [true] }, sinifRehberlik: { '*': true },
        tamamlamaAtamalari: { '*': [fields('saat sinif dersAdi nobetci izinli')] },
        zilYonetimi: {
            ...fields('aktif melodiOgrenci melodiOgretmen melodiCikis sesSeviyesi calmaSuresi haftasonuSessiz sesliAnons gorselBildirim nobetciVurgu neonEfekt'),
            cizelge: [bell], torenMuzikleri: [ceremony],
            customAudioOgrenci: fields('id'), customAudioOgretmen: fields('id'), customAudioCikis: fields('id')
        }
    };
    function project(value, schema) {
        if (schema === true) return value === null || ['string', 'number', 'boolean'].includes(typeof value) ? value : undefined;
        if (Array.isArray(schema)) return Array.isArray(value) ? value.map(item => project(item, schema[0])).filter(item => item !== undefined) : [];
        const result = {};
        if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
        for (const key of Object.keys(value)) {
            if (['__proto__', 'prototype', 'constructor'].includes(key)) continue;
            const rule = Object.hasOwn(schema, key) ? schema[key] : schema['*'];
            if (!rule) continue;
            const item = project(value[key], rule);
            if (item !== undefined) result[key] = item;
        }
        return result;
    }
    function emptyTemplate() {
        return {
            "okulAdi": "Seyir Dijital Pano",
            "okulTuru": "",
            "okulLogo": "img/seyir-icon.svg",
            "okulWebSiteUrl": "",
            "slogan": "Açık Kaynak Dijital Okul Panosu",
            "daktiloYazilari": [
                        "Okulun Dijital Nabzı"
            ],
            "mebHaberler": [],
            "fotograflar": [],
            "konum": {
                        "sehir": "",
                        "ilce": "",
                        "enlem": null,
                        "boylam": null
            },
            "ayarlar": {
                        "karuselSuresi": 5000,
                        "temaOtomatik": true,
                        "daktiloHiz": 90,
                        "daktiloBekleme": 2200,
                        "tickerDurum": true,
                        "tickerBaslik": "DUYURULAR",
                        "tickerHiz": "normal",
                        "tickerAyrac": "•",
                        "screensaver": {
                                    "aktif": true,
                                    "mesaiBaslangic": "07:30",
                                    "mesaiBitis": "17:30",
                                    "boslukDakika": 30,
                                    "haftasonuUyku": true
                        }
            },
            "gizlilik": {
                        "personelAdiGosterim": "gorev",
                        "nobetciGoster": true,
                        "rehberOgretmenGoster": false,
                        "dersOgretmeniGoster": false,
                        "saklamaSuresiGun": 365
            },
            "duyurular": [],
            "sinavlar": [],
            "kayanYazi": [],
            "tumOgretmenler": [],
            "ogretmenler": [],
            "ogretmenBranslar": [],
            "dersProgrami": [],
            "dersProgramiLise": [],
            "dersProgramiOrtaokul": [],
            "dersProgramiDetay": {},
            "dersHavuzuLise": [],
            "dersHavuzuOrtaokul": [],
            "sinifListesi": [],
            "sinifDersleri": {},
            "sinifDersOgretmen": {},
            "sinifRehberlik": {},
            "nobetciOgretmenler": [],
            "nobetciGunluk": {},
            "tamamlamaAtamalari": {},
            "otomatikYedek": {
                        "aktif": false,
                        "saat": "17:00",
                        "hedefTur": "indir",
                        "klasorAdi": "",
                        "sonYedekTarihi": "",
                        "sonYedekZamani": ""
            },
            "yedekGecmisi": [],
            "veriYonetimi": {},
            "zilYonetimi": {
                        "aktif": false,
                        "melodiOgrenci": "modern",
                        "melodiOgretmen": "chime",
                        "melodiCikis": "westminster",
                        "sesSeviyesi": 80,
                        "calmaSuresi": 8,
                        "haftasonuSessiz": true,
                        "sesliAnons": false,
                        "cizelge": [],
                        "torenMuzikleri": [],
                        "gecmis": []
            },
            "karuselVideolar": []
};
    }
    const stringArrays = new Set('daktiloYazilari fotograflar kayanYazi tumOgretmenler ogretmenler ogretmenBranslar nobetciOgretmenler dersHavuzuLise dersHavuzuOrtaokul sinifListesi bransListesi nobetAlanlari'.split(' '));
    const recordArrays = new Set('duyurular sinavlar mebHaberler karuselVideolar dersProgrami dersProgramiLise dersProgramiOrtaokul yedekGecmisi'.split(' '));
    const maps = new Set('ayarlar konum gizlilik dersProgramiDetay sinifDersleri sinifDersOgretmen sinifRehberlik nobetciGunluk tamamlamaAtamalari veriYonetimi otomatikYedek zilYonetimi'.split(' '));
    const boolKeys = new Set('aktif temaOtomatik tickerDurum haftasonuUyku nobetciGoster rehberOgretmenGoster dersOgretmeniGoster haftasonuSessiz sesliAnons gorselBildirim nobetciVurgu neonEfekt otomatikGec sesli altyaziKapat dongu torenModu'.split(' '));
    const numberKeys = new Set('karuselSuresi daktiloHiz daktiloBekleme boslukDakika saklamaSuresiGun sesSeviyesi calmaSuresi sure dosyaBoyut size'.split(' '));
    const MAX_MEDIA = 128 * 1024 * 1024;
    const clock = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    function validate(input) {
        if (!object(input)) throw new Error('JSON kökü bir nesne olmalıdır.');
        if (input._meta && input._meta.surum !== undefined && ![1, 2].includes(input._meta.surum)) throw new Error('Desteklenmeyen veri sürümü.');
        const data = JSON.parse(JSON.stringify(input));
        let count = 0;
        function walk(value, path = '', depth = 0) {
            if (++count > 100000 || depth > 40) throw new Error('Veri karmaşıklık sınırını aşıyor.');
            if (typeof value === 'string' && value.length > 2 * 1024 * 1024) throw new Error('Metin alanı çok büyük: ' + path);
            if (!value || typeof value !== 'object') return;
            if (Array.isArray(value) && value.length > 50000) throw new Error('Dizi çok büyük: ' + path);
            for (const key of Object.keys(value)) {
                if (['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Geçersiz veri anahtarı.');
                walk(value[key], path + '.' + key, depth + 1);
            }
        }
        walk(data);
        for (const key of [...stringArrays, ...recordArrays]) {
            // Eski boş kurulumun {} alanları için yalnızca boş nesne migrasyonu.
            if (['dersProgrami', 'dersProgramiLise', 'dersProgramiOrtaokul', 'nobetciOgretmenler'].includes(key) && object(data[key]) && Object.keys(data[key]).length === 0) data[key] = [];
            if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].some(item => stringArrays.has(key) ? typeof item !== 'string' : !object(item)))) throw new Error(key + ': geçersiz liste.');
        }
        for (const key of maps) if (data[key] !== undefined && !object(data[key])) throw new Error(key + ': nesne olmalıdır.');
        for (const key of ['okulAdi', 'okulTuru', 'okulLogo', 'okulWebSiteUrl', 'slogan']) if (data[key] !== undefined && typeof data[key] !== 'string') throw new Error(key + ': metin olmalıdır.');
        function checkRecord(item, schema, path) {
            if (!object(item)) throw new Error(path + ': geçersiz kayıt.');
            for (const [key, value] of Object.entries(item)) {
                if (value === null && /^customAudio(Ogrenci|Ogretmen|Cikis)$/.test(key)) continue;
                const rule = Object.hasOwn(schema, key) ? schema[key] : schema['*'];
                if (!rule) continue;
                if (rule === true) {
                    if (boolKeys.has(key)) { if (typeof value !== 'boolean') throw new Error(path + '.' + key + ': mantıksal değer olmalıdır.'); }
                    else if (numberKeys.has(key)) { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > (['size', 'dosyaBoyut'].includes(key) ? MAX_MEDIA : 10000000) || (['size', 'dosyaBoyut'].includes(key) && !Number.isInteger(value))) throw new Error(path + '.' + key + ': geçersiz sayı.'); }
                    else if (['enlem', 'boylam'].includes(key)) { if (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > (key === 'enlem' ? 90 : 180))) throw new Error('Geçersiz koordinat.'); }
                    else if (!(value === null && ['mediaId', 'youtubeId', 'customAudioId', 'customAudioName', 'audioId'].includes(key)) && typeof value !== 'string' && !(['saat', 'id', 'dersSaati', 'tickerHiz'].includes(key) && typeof value === 'number')) throw new Error(path + '.' + key + ': metin olmalıdır.');
                } else if (Array.isArray(rule)) {
                    if (!Array.isArray(value)) throw new Error(path + '.' + key + ': liste olmalıdır.');
                    value.forEach(v => {
                        if (rule[0] === true) { if (key === 'gunler' ? !Number.isInteger(v) || v < 0 || v > 6 : typeof v !== 'string') throw new Error(path + '.' + key + ': geçersiz değer.'); }
                        else checkRecord(v, rule[0], path + '.' + key);
                    });
                } else checkRecord(value, rule, path + '.' + key);
            }
        }
        normalizeProgram(data);
        checkRecord(data, publicSchema, 'veri');
        for (const rows of Object.values(data.tamamlamaAtamalari || {})) for (const row of rows) {
            if (!Number.isInteger(row.saat) || row.saat < 0 || row.saat > 99) throw new Error('Ders tamamlama saat indeksi geçersiz.');
        }
        checkRecord(data, {
            otomatikYedek: fields('aktif saat hedefTur klasorAdi sonYedekTarihi sonYedekZamani'),
            veriYonetimi: fields('sonGozdenGecirme'),
            zilYonetimi: {
                gecmis: [fields('saat baslik tur durum')],
                customAudioOgrenci: fields('id name type size'),
                customAudioOgretmen: fields('id name type size'),
                customAudioCikis: fields('id name type size')
            }
        }, 'ozel');
        for (const v of data.karuselVideolar || []) {
            if (v.youtubeId && !/^[A-Za-z0-9_-]{11}$/.test(v.youtubeId)) throw new Error('Geçersiz YouTube kimliği.');
        }
        for (const key of ['nobetciGunluk', 'sinifDersleri']) for (const list of Object.values(data[key] || {})) if (!Array.isArray(list) || list.some(v => typeof v !== 'string')) throw new Error(key + ': metin listesi olmalıdır.');
        for (const value of Object.values(data.sinifRehberlik || {})) if (typeof value !== 'string') throw new Error('Geçersiz rehberlik kaydı.');
        for (const map of Object.values(data.sinifDersOgretmen || {})) if (!object(map) || Object.values(map).some(v => typeof v !== 'string')) throw new Error('Geçersiz ders öğretmeni kaydı.');
        for (const key of ['dersProgrami', 'dersProgramiLise', 'dersProgramiOrtaokul']) for (const row of data[key] || []) {
            const parts = String(row.saat || '').split('-').map(s => s.trim());
            if (typeof row.ders !== 'string' || parts.length !== 2 || !parts.every(v => clock.test(v)) || parts[0] >= parts[1]) throw new Error(key + ': ders saat aralığı geçersiz.');
        }
        for (const row of [...(data.zilYonetimi?.cizelge || []), ...(data.zilYonetimi?.torenMuzikleri || [])]) if (!clock.test(row.saat || '')) throw new Error('Zil/tören saati geçersiz.');
        if (data.otomatikYedek?.saat !== undefined && !clock.test(data.otomatikYedek.saat)) throw new Error('Yedekleme saati geçersiz.');
        for (const key of ['mesaiBaslangic', 'mesaiBitis']) if (data.ayarlar?.screensaver?.[key] !== undefined && !clock.test(data.ayarlar.screensaver[key])) throw new Error('Mesai saati geçersiz.');
        if (data.gizlilik?.personelAdiGosterim && !['gorev', 'gizli', 'basHarf', 'tam'].includes(data.gizlilik.personelAdiGosterim)) throw new Error('Geçersiz gizlilik seçimi.');
        delete data._meta;
        const defaults = emptyTemplate();
        const result = { ...defaults, ...data };
        for (const key of ['ayarlar', 'konum', 'gizlilik', 'otomatikYedek', 'zilYonetimi']) result[key] = { ...defaults[key], ...data[key] };
        return result;
    }
    // Eski sayısal anahtarlı günleri ve seyrek dizileri, saat sırasını değiştirmeden taşır.
    function normalizeProgram(data) {
        for (const days of Object.values(data.dersProgramiDetay || {})) {
            if (!object(days)) throw new Error('Geçersiz sınıf programı.');
            for (const [day, slots] of Object.entries(days)) {
                if (!object(slots) && !Array.isArray(slots)) throw new Error('Günlük program liste veya saat nesnesi olmalıdır.');
                const keys = Object.keys(slots);
                if (keys.some(k => !/^(0|[1-9]\d*)$/.test(k) || Number(k) > 99)) throw new Error('Geçersiz ders indeksi.');
                const length = Math.max(Array.isArray(slots) ? slots.length : 0, ...keys.map(k => Number(k) + 1));
                if (length > 100) throw new Error('Günlük ders sınırı aşıldı.');
                days[day] = Array.from({length}, (_, i) => slots[i] == null ? {} : slots[i]);
            }
        }
        return data;
    }
    function clearPersonnel(data) {
        for (const key of ['tumOgretmenler', 'ogretmenler', 'ogretmenBranslar', 'nobetciOgretmenler', 'yedekGecmisi']) data[key] = [];
        for (const key of ['nobetciGunluk', 'sinifRehberlik', 'sinifDersOgretmen', 'tamamlamaAtamalari']) data[key] = {};
        if (data.zilYonetimi) data.zilYonetimi.gecmis = [];
        for (const days of Object.values(data.dersProgramiDetay || {})) for (const slots of Object.values(days || {})) {
            for (const row of Object.values(slots || {})) if (object(row)) { delete row.hoca; delete row.ogretmen; }
        }
        return data;
    }
    function publicExpiry(data) {
        const since = Date.parse(data.veriYonetimi?.sonGozdenGecirme || '');
        const days = Math.max(1, Number(data.gizlilik?.saklamaSuresiGun) || 365);
        return Number.isFinite(since) && since <= Date.now() ? since + days * 86400000 : 0;
    }
    function enforcePublicRetention(data, now = Date.now()) {
        const expires = data._meta?.personelSonKullanim;
        if (!Number.isFinite(expires) || expires <= now) {
            clearPersonnel(data);
            data._meta = {...data._meta, personelSonKullanim: 0};
        }
        return data;
    }
    const api = { projectPublic: value => project(normalizeProgram(JSON.parse(JSON.stringify(value))), publicSchema),
        emptyTemplate, validate, normalizeProgram, clearPersonnel, publicExpiry, enforcePublicRetention, MAX_MEDIA };
    root.SeyirDataPolicy = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
