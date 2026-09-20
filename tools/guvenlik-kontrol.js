#!/usr/bin/env node
/**
 * Seyir dağıtım öncesi güvenlik/KVKK teknik denetimi.
 * Değişiklik yapmaz; sorun bulursa çıkış kodu 1 döndürür.
 */

const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const oku = dosya => fs.readFileSync(path.join(KOK, dosya), 'utf8');
const sorunlar = [];

const indexHtml = oku('index.html');
const adminHtml = oku('admin.html');
const adminPhp = oku('admin.php');
const adminJs = oku('js/admin.js');
const localAuthJs = oku('js/local-auth.js');
const seyirJs = oku('js/seyir.js');
const fetchPhp = oku('fetch-haberler.php');
const fetchGorselPhp = oku('fetch-gorsel.php');
const veri = JSON.parse(oku('data/data.json'));

if ((veri.okulWebSiteUrl || '').trim() !== 'https://konyamcosihl.meb.k12.tr/') {
    sorunlar.push('data/data.json: başlangıç MEB okul adresi eksik veya hatalı');
}
if (veri.okulAdi !== 'Mahmud Celaleddin Ökten Anadolu İmam Hatip Lisesi') {
    sorunlar.push('data/data.json: başlangıç okul adı eksik veya hatalı');
}
if (!Array.isArray(veri.mebHaberler) || veri.mebHaberler.length < 1) {
    sorunlar.push('data/data.json: başlangıç haberleri eksik');
} else if (veri.mebHaberler.some(haber => !/^img\/cache-haber\/[A-Za-z0-9_.-]+\.(?:jpe?g|png|webp)$/i.test(haber.gorsel || ''))) {
    sorunlar.push('data/data.json: başlangıç haber görselleri yerel paket içinden gelmeli');
} else {
    for (const haber of veri.mebHaberler) {
        if (!fs.existsSync(path.join(KOK, haber.gorsel))) {
            sorunlar.push(`Başlangıç haber görseli eksik: ${haber.gorsel}`);
        }
    }
}

const ozelAlanlar = [
    'tumOgretmenler', 'ogretmenler', 'ogretmenBranslar', 'nobetciOgretmenler',
    'nobetciGunluk', 'sinifRehberlik', 'sinifDersOgretmen', 'tamamlamaAtamalari'
];

for (const alan of ozelAlanlar) {
    const deger = veri[alan];
    if (Array.isArray(deger) && deger.length > 0) sorunlar.push(`data/data.json: ${alan} boş olmalı`);
    if (deger && typeof deger === 'object' && !Array.isArray(deger) && Object.keys(deger).length > 0) {
        sorunlar.push(`data/data.json: ${alan} boş olmalı`);
    }
}

if (/DEFAULT_PIN|seyir_admin_pin/.test(adminJs + localAuthJs)) {
    sorunlar.push('Yönetim kodunda kaynak koda gömülü varsayılan PIN kalıntısı bulundu');
}
if (!/PBKDF2/.test(localAuthJs) || !/210000/.test(localAuthJs) || !/crypto\.subtle/.test(localAuthJs)) {
    sorunlar.push('js/local-auth.js: güçlü cihaz-yerel parola özeti yapılandırması eksik');
}
if (seyirJs.includes("localStorage.getItem('seyir_admin_data')")) {
    sorunlar.push('js/seyir.js: pano özel yönetim verisini doğrudan okuyor');
}
if (!seyirJs.includes("localStorage.getItem('seyir_public_data')")) {
    sorunlar.push('js/seyir.js: açık pano veri anahtarı bulunamadı');
}
if (!adminHtml.includes('js/local-auth.js') || !adminHtml.includes('local-auth-password-repeat')) {
    sorunlar.push('admin.html: cihaz-yerel ilk parola ekranı eksik');
}
if (!/href=["']admin\.html["']/.test(indexHtml) || /href=["']admin\.php["']/.test(indexHtml)) {
    sorunlar.push('index.html: imza kartı cihaz-yerel admin.html girişine yönlenmiyor');
}
if (!adminPhp.includes("header('Location: admin.html'")) {
    sorunlar.push('admin.php: eski bağlantı uyumluluk yönlendirmesi eksik');
}
if (!fetchPhp.includes("REQUEST_METHOD") || !fetchPhp.includes("'POST'")) {
    sorunlar.push('fetch-haberler.php: yalnızca POST kabul eden servis kontrolü eksik');
}
if (/file_put_contents|CIKTI_DOSYA|GORSEL_DIZIN/.test(fetchPhp)) {
    sorunlar.push('fetch-haberler.php: okula özgü haberleri sunucuya yazan kalıntı bulundu');
}
if (!fetchPhp.includes('fetch-gorsel.php?url=') || /file_put_contents/.test(fetchGorselPhp)) {
    sorunlar.push('Haber görselleri için yazmasız, aynı kaynaklı MEB aracısı eksik');
}
if (seyirJs.includes('data/meb_haberler.json')) {
    sorunlar.push('js/seyir.js: okullar arasında ortak haber önbelleği okunuyor');
}
if (/\.\.\/(?:nexus-auth\.js|styles\.css|login\.html)/.test(indexHtml + adminHtml)) {
    sorunlar.push('HTML: proje dışı NEXUS bağımlılığı bulundu');
}

for (const [ad, html] of [['index.html', indexHtml], ['admin.html', adminHtml]]) {
    const uzakBetikler = [...html.matchAll(/<script\b[^>]*\bsrc=["']https?:\/\/[^"']+["']/gi)];
    if (uzakBetikler.length > 0) sorunlar.push(`${ad}: ${uzakBetikler.length} uzak betik bulundu`);
    if (!/<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(html)) {
        sorunlar.push(`${ad}: Content Security Policy meta etiketi eksik`);
    }
}

const zorunluDosyalar = [
    'admin.php', 'fetch-gorsel.php', 'js/local-auth.js', 'lib/meb-parser.php',
    'css/fontawesome.min.css', 'webfonts/fa-solid-900.woff2',
    'js/vendor/xlsx.full.min.js',
    'KURULUM-GUVENLIK-KONTROL-LISTESI.md', 'KVKK-AYDINLATMA-SABLONU.md'
];
for (const dosya of zorunluDosyalar) {
    if (!fs.existsSync(path.join(KOK, dosya))) sorunlar.push(`${dosya}: zorunlu dosya eksik`);
}

if (sorunlar.length > 0) {
    console.error(`❌ ${sorunlar.length} güvenlik sorunu bulundu:`);
    sorunlar.forEach(sorun => console.error('   • ' + sorun));
    process.exit(1);
}

console.log('✅ Güvenlik kontrolü temiz: cihaz-yerel parola/veri ayrımı ve yazmasız haber servisi doğrulandı.');
