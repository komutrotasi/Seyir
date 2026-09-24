<?php
/**
 * fetch-haberler.php
 * MEB okul sitesinden haberleri anlık olarak çeker ve JSON yanıtı döndürür.
 * Okula özgü içerik sunucuya yazılmaz; çağıran tarayıcı kendi yerel alanına kaydeder.
 * PHP 7.2+ uyumlu.
 *
 * ─── Madde 1.1: cPanel cURL/haber çekme düzeltmesi ───
 *   - DNS/IP sabitlemeli cURL bağlantısı ve kesin yanıt boyutu sınırı
 *   - User-Agent, Referer, Accept header'ları
 *   - Yapılandırılmış JSON hata yanıtı
 *   - haberbant, pgwSlider ve Owl Carousel tabanlı farklı MEB temaları
 *
 * Görseller sunucuya kaydedilmez; doğrulanmış MEB adresleri aynı alan adındaki
 * geçici görsel aracısı üzerinden tarayıcıya iletilir.
 */

require_once __DIR__ . '/lib/meb-parser.php';
require_once __DIR__ . '/lib/rate-limit.php';

error_reporting(0);
ini_set('display_errors', 0);

// JSON yanıt header'ı (seyir.js fetch ile çağırdığında temiz parse edilsin)
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function seyirHaberHizSiniri($limit = 12, $pencere = 60) {
    return !seyirHizSiniriniAsiyorMu('haber', $limit, $pencere);
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(array('durum' => 'hata', 'kod' => 405, 'mesaj' => 'Bu servis yalnızca paneldeki yenileme butonuyla kullanılabilir.'), JSON_UNESCAPED_UNICODE);
    exit;
}

if (!seyirHaberHizSiniri()) {
    http_response_code(429);
    header('Retry-After: 60');
    echo json_encode(array('durum' => 'hata', 'kod' => 429, 'mesaj' => 'Çok fazla haber yenileme isteği gönderildi.'), JSON_UNESCAPED_UNICODE);
    exit;
}

$icerikUzunlugu = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($icerikUzunlugu > 8192) {
    http_response_code(413);
    echo json_encode(array('durum' => 'hata', 'kod' => 413, 'mesaj' => 'İstek gövdesi sınırı aşıldı.'), JSON_UNESCAPED_UNICODE);
    exit;
}

// Tarayıcı çağrılarında yalnızca aynı alan adından gelen istekleri kabul et.
$istekOrigin = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
$sunucuHost = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
$originHost = strtolower((string) parse_url($istekOrigin, PHP_URL_HOST));
$fetchSite = strtolower((string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? ''));
if (
    $istekOrigin === '' || $originHost === '' || $sunucuHost === '' ||
    !hash_equals($sunucuHost, $originHost) ||
    ($fetchSite !== '' && $fetchSite !== 'same-origin')
) {
    http_response_code(403);
    echo json_encode(array('durum' => 'hata', 'kod' => 403, 'mesaj' => 'İstek kaynağına izin verilmedi.'), JSON_UNESCAPED_UNICODE);
    exit;
}

// ─── Madde 3.1: Dinamik Okul Web Sitesi ve URL Belirleme ───
$istenenUrl = trim((string) ($_POST['url'] ?? ''));
if ($istenenUrl === '' || strlen($istenenUrl) > 4096) {
    http_response_code(400);
    echo json_encode(array('durum' => 'hata', 'kod' => 400, 'mesaj' => 'Okul web sitesi adresi zorunludur.'), JSON_UNESCAPED_UNICODE);
    exit;
}
$kaynakUrl = $istenenUrl;

// URL Protokol Kontrolü & Normalize
if (!preg_match('~^https?://~i', $kaynakUrl)) {
    $kaynakUrl = 'https://' . $kaynakUrl;
} elseif (preg_match('~^http://~i', $kaynakUrl)) {
    $kaynakUrl = preg_replace('~^http://~i', 'https://', $kaynakUrl);
}

$parsedUrl = parse_url($kaynakUrl);
$kaynakHost = !empty($parsedUrl['host']) ? strtolower($parsedUrl['host']) : '';
$kaynakBase = (!empty($parsedUrl['scheme']) ? $parsedUrl['scheme'] : 'https') . '://' . $kaynakHost;
if (!empty($parsedUrl['port'])) {
    $kaynakBase .= ':' . $parsedUrl['port'];
}

// Güvenlik: Yalnızca resmî MEB okul alan adları kullanılabilir.
$allowedDomains = array('meb.k12.tr', 'meb.gov.tr');

/**
 * Güvenlik: SSRF Doğrulayıcı (Yerel/Özel IP Engelleme)
 */
function isMebHost($host) {
    global $allowedDomains;
    $host = strtolower(rtrim((string) $host, '.'));
    foreach ($allowedDomains as $domain) {
        if ($host === $domain || substr($host, -(strlen($domain) + 1)) === '.' . $domain) {
            return true;
        }
    }
    return false;
}

function isPublicIp($ip) {
    return filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    ) !== false;
}

function isGuvenliUrl($url, $host, &$hata, $dnsKontrol = true) {
    if (empty($host)) {
        $hata = 'Geçersiz hedef alan adı (host).';
        return false;
    }

    $parsed = parse_url($url);
    $scheme = isset($parsed['scheme']) ? strtolower($parsed['scheme']) : '';
    if ($scheme !== 'https') {
        $hata = 'Yalnızca HTTPS kaynaklarına izin verilir.';
        return false;
    }

    if (!empty($parsed['user']) || !empty($parsed['pass']) || preg_match('/[\x00-\x20\x7f]/', (string) $url)) {
        $hata = 'Kimlik bilgisi veya geçersiz karakter içeren adresler engellendi.';
        return false;
    }

    if (!empty($parsed['port']) && (int) $parsed['port'] !== 443) {
        $hata = 'Standart HTTPS portu dışındaki bağlantılar engellendi.';
        return false;
    }

    if (!isMebHost($host)) {
        $hata = 'Yalnızca meb.k12.tr ve meb.gov.tr alan adlarına izin verilir.';
        return false;
    }

    if (!$dnsKontrol) return true;

    // DNS çözümlemesi sonucu yerel/özel IP'ye giden alan adlarını da engelle.
    $adresler = @gethostbynamel($host);
    if ($adresler === false || count($adresler) === 0) {
        $hata = 'Hedef alan adının DNS kaydı çözümlenemedi.';
        return false;
    }
    foreach ($adresler as $ip) {
        if (!isPublicIp($ip)) {
            $hata = 'Hedef alan adı özel veya rezerve bir IP adresine yönleniyor.';
            return false;
        }
    }
    return true;
}

$ssrfHatasi = '';
if (!isGuvenliUrl($kaynakUrl, $kaynakHost, $ssrfHatasi, false)) {
    jsonHataYaniti('Güvenlik ihlali: ' . $ssrfHatasi, 400, array('url' => $kaynakUrl));
}

// Dış bağlantıdan hemen önce DNS/IP güvenliğini doğrula.
$ssrfHatasi = '';
if (!isGuvenliUrl($kaynakUrl, $kaynakHost, $ssrfHatasi, true)) {
    jsonHataYaniti('Güvenlik ihlali: ' . $ssrfHatasi, 400, array('url' => $kaynakUrl));
}

/**
 * Yapılandırılmış JSON hata yanıtı döndür ve çık (Madde 4.3)
 */
function jsonHataYaniti($mesaj, $kod = 500, $ekBilgi = array()) {
    $httpKod = (int) $kod;
    if ($httpKod < 400 || $httpKod > 599) $httpKod = 500;
    http_response_code($httpKod);
    $yanit = array(
        'durum'       => 'hata',
        'mesaj'       => $mesaj,
        'kod'         => $kod,
        'zaman'       => date('Y-m-d H:i:s')
    );
    if (!empty($ekBilgi)) {
        $yanit['detay'] = $ekBilgi;
    }
    echo json_encode($yanit, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * URL Güvenlik Doğrulayıcı — Yalnızca whitelist'teki domainlerden indirmeye izin verir
 */
function isUrlAllowed($url) {
    $parsed = parse_url($url);
    if (!$parsed || empty($parsed['host'])) return false;
    if (strtolower($parsed['scheme'] ?? '') !== 'https') return false;
    if (!empty($parsed['port']) && (int) $parsed['port'] !== 443) return false;
    $host = strtolower($parsed['host']);
    return isMebHost($host);
}

function seyirGorselProxyAdresi($url) {
    if (!isUrlAllowed($url)) return '';
    return 'fetch-gorsel.php?url=' . rawurlencode($url);
}

/**
 * cPanel Uyumlu Güvenli HTTP GET İsteği
 * Madde 1.1: cURL + User-Agent + Referer + Accept header'ları
 */
function httpGet($url, &$hataBilgisi = '') {
    global $kaynakBase;

    if (empty($url)) {
        $hataBilgisi = 'URL boş';
        return false;
    }

    if (!isUrlAllowed($url)) {
        $hataBilgisi = 'URL izin verilen MEB alan adlarının dışında.';
        return false;
    }

    if (!function_exists('curl_init')) {
        $hataBilgisi = 'Güvenli dış bağlantı için PHP cURL eklentisi zorunludur.';
        return false;
    }

    $parsed = parse_url($url);
    $host = isset($parsed['host']) ? strtolower((string) $parsed['host']) : '';
    $dnsHatasi = '';
    if (!isGuvenliUrl($url, $host, $dnsHatasi, true)) {
        $hataBilgisi = $dnsHatasi;
        return false;
    }
    $adresler = @gethostbynamel($host);
    if ($adresler === false || count($adresler) === 0) {
        $hataBilgisi = 'Hedef alan adı bağlantı öncesinde çözümlenemedi.';
        return false;
    }
    foreach ($adresler as $ip) {
        if (!isPublicIp($ip)) {
            $hataBilgisi = 'Hedef alan adı bağlantı öncesinde özel veya rezerve bir IP adresine yönlendi.';
            return false;
        }
    }

    $azamiBoyut = 3 * 1024 * 1024;
    $data = '';
    $boyutAsildi = false;
    $ch = curl_init();
    $curlAyarlar = array(
        CURLOPT_URL => $url,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 7,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'Seyir-Dijital-Pano/1.0',
        CURLOPT_REFERER => $kaynakBase . '/',
        CURLOPT_HTTPHEADER => array(
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.1',
            'Accept-Language: tr-TR,tr;q=0.9',
            'Accept-Encoding: identity',
            'Connection: close'
        ),
        CURLOPT_RESOLVE => array($host . ':443:' . $adresler[0]),
        CURLOPT_WRITEFUNCTION => function ($curl, $parca) use (&$data, &$boyutAsildi, $azamiBoyut) {
            if (strlen($data) + strlen($parca) > $azamiBoyut) {
                $boyutAsildi = true;
                return 0;
            }
            $data .= $parca;
            return strlen($parca);
        }
    );
    if (defined('CURLOPT_PROTOCOLS') && defined('CURLPROTO_HTTPS')) {
        $curlAyarlar[CURLOPT_PROTOCOLS] = CURLPROTO_HTTPS;
    }
    curl_setopt_array($ch, $curlAyarlar);
    $basarili = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlErrno = curl_errno($ch);
    curl_close($ch);

    if ($boyutAsildi) {
        $hataBilgisi = 'MEB yanıtı 3 MB güvenlik sınırını aşıyor.';
        return false;
    }
    if ($httpCode >= 300 && $httpCode < 400) {
        $hataBilgisi = 'Güvenlik nedeniyle uzak sunucu yönlendirmeleri takip edilmez.';
        return false;
    }
    if ($basarili && $httpCode >= 200 && $httpCode < 300 && strlen($data) > 100) {
        return $data;
    }
    $hataBilgisi = "cURL başarısız: HTTP $httpCode, errno=$curlErrno, $curlError";
    return false;
}

// ── Ana sayfa HTML'ini çek ─────────────────────────────────────────────────
$hataBilgisi = '';
$html = httpGet($kaynakUrl, $hataBilgisi);

if (!$html) {
    jsonHataYaniti(
        'MEB okul sitesi çekilemedi. Sunucu bağlantı hatası.',
        503,
        array(
            'kaynak_url'   => $kaynakUrl,
            'hata_detayi'  => $hataBilgisi,
            'oneriler'     => array(
                'cPanel PHP ayarlarında cURL eklentisinin aktif olduğunu kontrol edin.',
                'Sunucunun dış bağlantı (outbound) izni var mı kontrol edin.',
                'MEB sitesinin erişilebilir olduğunu tarayıcıdan doğrulayın.'
            )
        )
    );
}

if (function_exists('mb_detect_encoding') && function_exists('mb_convert_encoding')) {
    if (mb_detect_encoding($html, 'UTF-8', true) === false) {
        $html = mb_convert_encoding($html, 'UTF-8', 'ISO-8859-9');
    }
}

$ayristirma = seyirMebHaberleriniAyristir($html, $kaynakBase);
$haberler = $ayristirma['haberler'];
$ayristirici = $ayristirma['ayristirici'];

// Uzak görselleri doğrudan tarayıcıya bırakmak bazı MEB sunucularında kırık
// görsele neden oluyor. Aynı alan adındaki salt-okunur aracı CORS/hotlink
// farklarını giderir; sunucuda okul verisi veya görsel dosyası oluşturmaz.
foreach ($haberler as &$haber) {
    if (!empty($haber['gorsel'])) $haber['gorsel'] = seyirGorselProxyAdresi($haber['gorsel']);
}
unset($haber);

// Parser MEB şablonunu tanıyamazsa tarayıcıdaki mevcut okul haberleri korunur.
if (count($haberler) === 0) {
    jsonHataYaniti(
        'Kaynak sayfada desteklenen yapıda haber bulunamadı; bu cihazdaki mevcut haberler korundu.',
        422,
        array('kaynak_url' => $kaynakUrl)
    );
}

// ── 3. JSON kaydet ────────────────────────────────────────────────────────
$veri = array(
    'durum'      => 'basarili',
    'guncelleme' => date('Y-m-d H:i:s'),
    'kaynak'     => $kaynakUrl,
    'haberler'   => $haberler,
    'istatistik' => array(
        'toplam'        => count($haberler),
        'gorselli'      => count(array_filter($haberler, function($h) { return !empty($h['gorsel']); })),
        'base64_embed'  => count(array_filter($haberler, function($h) { return strpos($h['gorsel'] ?? '', 'data:') === 0; })),
        'metin_only'    => count(array_filter($haberler, function($h) { return $h['tip'] === 'metin'; })),
        'ayristirici'   => $ayristirici
    )
);

// Sonuç yalnızca çağıran tarayıcıya gönderilir; sunucuda okul verisi oluşturulmaz.
echo json_encode($veri, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
