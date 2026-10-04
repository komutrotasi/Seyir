#!/usr/bin/env node
/**
 * Madde 4.1 — Cache-Buster Otomasyonu
 *
 * index.html ve admin.html içindeki  ?v=...  sorgu parametrelerini,
 * atıf yapılan yerel dosyanın İÇERİK ÖZETİNE (hash) göre otomatik günceller.
 *
 * Neden hash? Tarih tabanlı sürümde dosya değişmese bile her gün önbellek
 * boşa düşer. Hash ile sürüm YALNIZCA dosya gerçekten değiştiğinde değişir.
 *
 * Kullanım:
 *   node tools/surum-guncelle.js          → dosyaları günceller
 *   node tools/surum-guncelle.js --kontrol → değişiklik yazmaz, sadece raporlar
 *                                            (güncel değilse çıkış kodu 1)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KOK = path.resolve(__dirname, '..');
const HEDEF_HTML = ['index.html', 'admin.html'];
const SADECE_KONTROL = process.argv.includes('--kontrol');

/** Yerel varlık dosyasının kısa içerik özeti. */
function icerikOzeti(dosyaYolu) {
    const veri = fs.readFileSync(dosyaYolu, 'utf8');
    return crypto.createHash('md5').update(veri).digest('hex').slice(0, 8);
}

function tarihDamgasi(dosyaYolu) {
    const d = fs.statSync(dosyaYolu).mtime;
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

let degisenToplam = 0;
let guncelDegil = 0;

for (const htmlAd of HEDEF_HTML) {
    const htmlYol = path.join(KOK, htmlAd);
    if (!fs.existsSync(htmlYol)) {
        console.log(`  ⚠️  ${htmlAd} bulunamadı, atlanıyor.`);
        continue;
    }

    let html = fs.readFileSync(htmlYol, 'utf8');
    const orijinal = html;

    // href="css/x.css?v=..."  veya  src="js/x.js?v=..."
    html = html.replace(
        /(\b(?:href|src)=")((?:css|js)\/[^"?]+)\?v=([^"]*)(")/g,
        (tam, on, varlikYolu, eskiSurum, son) => {
            const varlikTam = path.join(KOK, varlikYolu);
            if (!fs.existsSync(varlikTam)) {
                console.log(`  ⚠️  ${htmlAd}: ${varlikYolu} bulunamadı, sürüm korunuyor.`);
                return tam;
            }
            const yeniSurum = `${tarihDamgasi(varlikTam)}_${icerikOzeti(varlikTam)}`;
            if (eskiSurum === yeniSurum) {
                console.log(`  ✓  ${htmlAd}: ${varlikYolu}  (güncel: ${yeniSurum})`);
            } else {
                console.log(`  ↻  ${htmlAd}: ${varlikYolu}  ${eskiSurum} → ${yeniSurum}`);
                degisenToplam++;
                guncelDegil++;
            }
            return `${on}${varlikYolu}?v=${yeniSurum}${son}`;
        }
    );

    if (html !== orijinal && !SADECE_KONTROL) {
        fs.writeFileSync(htmlYol, html, 'utf8');
    }
}

console.log('');
if (SADECE_KONTROL) {
    if (guncelDegil > 0) {
        console.log(`❌ ${guncelDegil} sürüm etiketi güncel değil. "node tools/surum-guncelle.js" çalıştırın.`);
        process.exit(1);
    }
    console.log('✅ Tüm sürüm etiketleri güncel.');
} else {
    console.log(degisenToplam > 0
        ? `✅ ${degisenToplam} sürüm etiketi güncellendi.`
        : '✅ Tüm sürüm etiketleri zaten güncel.');
}

// HTML ve SW aynı sürümlü yolları kullanır; dosya değişimi yeni kabuk sürümü üretir.
const precache = new Set(['./', './index.html', './admin.html', './manifest.json', './img/seyir-icon.svg',
    './img/seyir-icon-192.png', './img/seyir-icon-192.png', './img/seyir-icon-512.png', './css/fonts/UthmanicHafs.otf', './webfonts/fa-solid-900.woff2',
    './data/data.json', './data/dini_icerik.json', './data/meb_haberler.json']);
for (const file of HEDEF_HTML) {
    const html = fs.readFileSync(path.join(KOK, file), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="((?:css|js)\/[^" ]+)"/g)) precache.add('./' + match[1]);
}
const assets = [...precache];
const hash = crypto.createHash('sha256');
for (const url of assets) {
    const filename = url === './' ? 'index.html' : url.slice(2).split('?')[0];
    hash.update(url).update(fs.readFileSync(path.join(KOK, filename)));
}
const swPath = path.join(KOK, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const marker = /\/\/ GENERATED-PRECACHE-START[\s\S]*?\/\/ GENERATED-PRECACHE-END/;
hash.update(sw.replace(marker, ''));
const generated = '// GENERATED-PRECACHE-START\nconst RELEASE = ' + JSON.stringify(hash.digest('hex').slice(0, 16)) + ';\nconst PRECACHE_ASSETS = ' + JSON.stringify(assets, null, 4) + ';\n// GENERATED-PRECACHE-END';
if (!marker.test(sw)) throw new Error('SW üretim alanı bulunamadı.');
if (sw.match(marker)[0] !== generated) {
    if (SADECE_KONTROL) { console.error('Service Worker varlık listesi/sürümü güncel değil.'); process.exit(1); }
    fs.writeFileSync(swPath, sw.replace(marker, generated), 'utf8');
    console.log('Service Worker varlık listesi ve sürümü güncellendi.');
}
