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
const swJs = oku('sw.js');
const htaccess = oku('.htaccess');
const fetchPhp = oku('fetch-haberler.php');
const fetchGorselPhp = oku('fetch-gorsel.php');
const rateLimitPhp = oku('lib/rate-limit.php');
const xlsxYolu = path.join(KOK, 'js/vendor/xlsx.full.min.js');
const veri = JSON.parse(oku('data/data.json'));
const dataPolicy = require(path.join(KOK, 'js/data-policy.js'));

if (JSON.stringify(veri) !== JSON.stringify(dataPolicy.emptyTemplate())) {
    sorunlar.push('data/data.json yalnızca nötr sıfır-preset başlangıç şablonu olmalı');
}
if (/getOrnekOgretmenVeNobetVerisi/.test(adminJs)) sorunlar.push('Otomatik örnek personel ekleme kaldırılmalı');

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
if (/CURLOPT_FOLLOWLOCATION\s*=>\s*true|file_get_contents\s*\(\s*\$url/.test(fetchPhp)) {
    sorunlar.push('fetch-haberler.php: doğrulanmamış yönlendirme veya güvensiz URL akışı etkin');
}
if (!fetchPhp.includes('CURLOPT_RESOLVE') || !fetchPhp.includes('3 * 1024 * 1024')) {
    sorunlar.push('fetch-haberler.php: DNS/IP sabitlemesi veya 3 MB yanıt sınırı eksik');
}
if (!fetchPhp.includes('HTTP_ORIGIN') || !fetchPhp.includes('HTTP_SEC_FETCH_SITE')) {
    sorunlar.push('fetch-haberler.php: aynı kaynak/fetch metadata doğrulaması eksik');
}
if (!fetchPhp.includes('seyirHaberHizSiniri') || !fetchPhp.includes('429')) {
    sorunlar.push('fetch-haberler.php: istek hız sınırı eksik');
}
if (!rateLimitPhp.includes('flock') || !rateLimitPhp.includes('sys_get_temp_dir') || !rateLimitPhp.includes('2 * 1024 * 1024')) {
    sorunlar.push('lib/rate-limit.php: APCu dışı kilitli ve boyut sınırlı hız sayacı eksik');
}
if (/file_put_contents|CIKTI_DOSYA|GORSEL_DIZIN/.test(fetchPhp)) {
    sorunlar.push('fetch-haberler.php: okula özgü haberleri sunucuya yazan kalıntı bulundu');
}
if (!fetchPhp.includes('fetch-gorsel.php?url=') || /file_put_contents/.test(fetchGorselPhp)) {
    sorunlar.push('Haber görselleri için yazmasız, aynı kaynaklı MEB aracısı eksik');
}
if (/file_get_contents\s*\(\s*\$url/.test(fetchGorselPhp) || !fetchGorselPhp.includes('CURLOPT_RESOLVE')) {
    sorunlar.push('fetch-gorsel.php: DNS/IP sabitlemesiz uzak görsel akışı bulundu');
}
if (!fetchGorselPhp.includes('seyirGorselHizSiniri') || !fetchGorselPhp.includes('HTTP_REFERER')) {
    sorunlar.push('fetch-gorsel.php: aynı kaynak veya istek hız sınırı eksik');
}
if (/preview\.innerHTML\s*=.*\$\{file\.name\}/.test(adminJs)) {
    sorunlar.push('js/admin.js: dosya adı innerHTML ile kaçışsız basılıyor');
}
if (!oku('js/backup.js').includes('delete veri.yedekGecmisi')) {
    sorunlar.push('js/admin.js: yedek geçmişinin kendi içine katlanmasını önleyen temizlik eksik');
}

try {
    delete require.cache[require.resolve(xlsxYolu)];
    const xlsx = require(xlsxYolu);
    const parcalar = String(xlsx.version || '0.0.0').split('.').map(Number);
    const guvenli = parcalar[0] > 0 || parcalar[1] > 20 || (parcalar[1] === 20 && parcalar[2] >= 2);
    if (!guvenli) sorunlar.push(`js/vendor/xlsx.full.min.js: güvensiz SheetJS sürümü (${xlsx.version || 'bilinmiyor'})`);
} catch (error) {
    sorunlar.push('js/vendor/xlsx.full.min.js: sürüm doğrulanamadı');
}
if (seyirJs.includes('data/meb_haberler.json')) {
    sorunlar.push('js/seyir.js: okullar arasında ortak haber önbelleği okunuyor');
}
if (!swJs.includes('self.skipWaiting()') || !adminJs.includes("updateViaCache: 'none'") || !seyirJs.includes("updateViaCache: 'none'")) {
    sorunlar.push('PWA: yeni Service Worker sürümünün gecikmeden etkinleşme akışı eksik');
}
if (!adminJs.includes("addEventListener('controllerchange'") || !seyirJs.includes("addEventListener('controllerchange'")) {
    sorunlar.push('PWA: etkinleşen sürümden sonra kontrollü sayfa yenilemesi eksik');
}
if (!/<Files\s+["']sw\.js["']>[\s\S]*Cache-Control\s+["']no-cache, no-store, must-revalidate["']/i.test(htaccess)) {
    sorunlar.push('.htaccess: sw.js için güncel sürümü zorlayan önbellek başlığı eksik');
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
    const kimlikler = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(eslesme => eslesme[1]);
    const tekrarlar = kimlikler.filter((kimlik, i) => kimlikler.indexOf(kimlik) !== i);
    if (tekrarlar.length > 0) sorunlar.push(`${ad}: yinelenen HTML id bulundu (${[...new Set(tekrarlar)].join(', ')})`);
}

const zorunluDosyalar = [
    'admin.php', 'fetch-gorsel.php', 'js/local-auth.js', 'js/backup-handle-store.js', 'lib/meb-parser.php',
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
