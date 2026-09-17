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
const seyirJs = oku('js/seyir.js');
const veri = JSON.parse(oku('data/data.json'));

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

if (/DEFAULT_PIN|seyir_admin_pin|seyir_admin_auth/.test(adminJs)) {
    sorunlar.push('js/admin.js: istemci taraflı varsayılan PIN/oturum kalıntısı bulundu');
}
if (seyirJs.includes("localStorage.getItem('seyir_admin_data')")) {
    sorunlar.push('js/seyir.js: pano özel yönetim verisini doğrudan okuyor');
}
if (!seyirJs.includes("localStorage.getItem('seyir_public_data')")) {
    sorunlar.push('js/seyir.js: açık pano veri anahtarı bulunamadı');
}
if (!adminHtml.includes('<!-- SEYIR_SERVER_SESSION -->')) {
    sorunlar.push('admin.html: sunucu oturumu enjeksiyon işareti eksik');
}
if (!adminHtml.includes('<!-- SEYIR_PASSWORD_CSRF -->') || !adminPhp.includes("isset($_POST['parola_degistir'])")) {
    sorunlar.push('Yönetici parola değiştirme akışı veya CSRF alanı eksik');
}
if (!adminPhp.includes("isset($_POST['ilk_kurulum'])") || !adminPhp.includes("isset($_GET['seyir_probe'])")) {
    sorunlar.push('Web ilk kurulum veya statik sunucu kontrolü eksik');
}
if (/href=["']admin\.html["']/.test(indexHtml)) {
    sorunlar.push('index.html: eski ve korumasız admin.html bağlantısı bulundu');
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
    'admin.php', 'lib/admin-auth.php', 'lib/meb-parser.php',
    'css/fontawesome.min.css', 'webfonts/fa-solid-900.woff2',
    'js/vendor/xlsx.full.min.js', 'config/admin-auth.example.php',
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

console.log('✅ Güvenlik kontrolü temiz: veri ayrımı, sunucu oturumu ve yerel bağımlılıklar doğrulandı.');
