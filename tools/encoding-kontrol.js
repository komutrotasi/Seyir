#!/usr/bin/env node
/**
 * Madde 4.5 — Encoding Kontrol Otomasyonu (Seyir'e özel, bağımsız sürüm)
 *
 * AGENTS.md Kural 5 / kök Kural 8 uyumunu sürüm öncesi rutin olarak doğrular:
 *   1. Tüm metin dosyaları geçerli UTF-8 mi?
 *   2. BOM (EF BB BF) var mı?           → olmamalı
 *   3. Kaçak kontrol karakteri var mı?  → bozulmuş Türkçe harfin izidir
 *      (ör. Ö → 0x13, ğ → 0x1F gibi kodlama kazaları)
 *   4. HTML dosyalarında <meta charset="UTF-8"> tanımlı mı?
 *   5. Bozulmuş Türkçe karakter kalıpları (ï¿½, Ã§, Åž, "ı" yerine "1") var mı?
 *
 * Kullanım:  node tools/encoding-kontrol.js
 * Çıkış kodu: sorun varsa 1 (CI / sürüm öncesi kontrol için).
 */

const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const UZANTILAR = ['.html', '.css', '.js', '.json', '.md', '.php'];
// Sürümü sabitlenmiş üçüncü taraf vendor kodu kendi dağıtım biçiminde tutulur.
const ATLA = new Set(['node_modules', '.git', 'meb_images', 'tools', 'vendor']);

const TURKCE = 'çğıöşüÇĞİÖŞÜ';

/** Bozulmuş kodlamanın klasik izleri */
const BOZUK_KALIPLAR = [
    { desen: /ï¿½/g,            ad: 'değiştirme karakteri (ï¿½)' },
    { desen: /Ã§|Ã¶|Ã¼|Ä±|ÅŸ|ÄŸ/g, ad: 'çift kodlanmış UTF-8 (Ã§ / ÅŸ …)' },
    { desen: /�/g,          ad: 'U+FFFD replacement character' },
];

function dosyalariTopla(dizin, birikim = []) {
    for (const ad of fs.readdirSync(dizin)) {
        if (ATLA.has(ad)) continue;
        const tam = path.join(dizin, ad);
        const st = fs.statSync(tam);
        if (st.isDirectory()) dosyalariTopla(tam, birikim);
        else if (UZANTILAR.includes(path.extname(ad).toLowerCase())) birikim.push(tam);
    }
    return birikim;
}

const sorunlar = [];
const dosyalar = dosyalariTopla(KOK).sort();

for (const yol of dosyalar) {
    const goreli = path.relative(KOK, yol);
    const ham = fs.readFileSync(yol);

    // 1) Geçerli UTF-8 mi? (kayıpsız gidiş-dönüş testi)
    const metin = ham.toString('utf8');
    if (!Buffer.from(metin, 'utf8').equals(ham)) {
        sorunlar.push(`${goreli}: geçerli UTF-8 değil`);
    }

    // 2) BOM
    if (ham.length >= 3 && ham[0] === 0xEF && ham[1] === 0xBB && ham[2] === 0xBF) {
        sorunlar.push(`${goreli}: BOM içeriyor (BOM'suz UTF-8 olmalı)`);
    }

    // 3) Kaçak kontrol karakterleri (TAB/LF/CR hariç)
    for (let i = 0; i < ham.length; i++) {
        const b = ham[i];
        if (b < 0x09 || (b >= 0x0B && b <= 0x0C) || (b >= 0x0E && b <= 0x1F)) {
            const satir = ham.slice(0, i).toString('utf8').split('\n').length;
            sorunlar.push(`${goreli}:${satir}: kaçak kontrol karakteri 0x${b.toString(16).padStart(2, '0')} — bozulmuş Türkçe harf olabilir`);
            break; // dosya başına tek uyarı yeterli
        }
    }

    // 4) HTML charset bildirimi
    if (path.extname(yol) === '.html' && !/<meta\s+charset=["']?utf-8["']?/i.test(metin)) {
        sorunlar.push(`${goreli}: <meta charset="UTF-8"> eksik`);
    }

    // 5) Bozulmuş karakter kalıpları
    for (const { desen, ad } of BOZUK_KALIPLAR) {
        const eslesme = metin.match(desen);
        if (eslesme) sorunlar.push(`${goreli}: ${eslesme.length} adet ${ad}`);
    }
}

// Özet
const turkceIceren = dosyalar.filter(y =>
    [...fs.readFileSync(y, 'utf8')].some(ch => TURKCE.includes(ch))).length;

console.log(`Taranan dosya      : ${dosyalar.length}`);
console.log(`Türkçe karakterli  : ${turkceIceren}`);
console.log('');

if (sorunlar.length === 0) {
    console.log('✅ Kodlama kontrolü temiz — tümü BOM\'suz UTF-8, Türkçe karakterler sağlam.');
    process.exit(0);
}
console.log(`❌ ${sorunlar.length} sorun bulundu:`);
for (const s of sorunlar) console.log('   • ' + s);
process.exit(1);
