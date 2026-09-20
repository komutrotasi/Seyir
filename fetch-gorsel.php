<?php
/**
 * Doğrulanmış MEB haber görsellerini aynı alan adı üzerinden iletir.
 * Dosya veya okul verisi sunucuya kaydedilmez; görsel tarayıcı önbelleğinde tutulur.
 * PHP 7.2+ uyumludur.
 */

error_reporting(0);
ini_set('display_errors', 0);

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');

function seyirGorselHata($mesaj, $kod) {
    http_response_code((int) $kod);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    echo $mesaj;
    exit;
}

function seyirGorselMebHostMu($host) {
    $host = strtolower(rtrim((string) $host, '.'));
    foreach (array('meb.k12.tr', 'meb.gov.tr') as $alan) {
        if ($host === $alan || substr($host, -(strlen($alan) + 1)) === '.' . $alan) return true;
    }
    return false;
}

function seyirGorselAcikIpMi($ip) {
    return filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    ) !== false;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    header('Allow: GET');
    seyirGorselHata('Yalnızca GET isteğine izin verilir.', 405);
}

$url = trim((string) ($_GET['url'] ?? ''));
if ($url === '' || strlen($url) > 4096) seyirGorselHata('Geçersiz görsel adresi.', 400);

$parcalar = parse_url($url);
$host = isset($parcalar['host']) ? strtolower((string) $parcalar['host']) : '';
$sema = isset($parcalar['scheme']) ? strtolower((string) $parcalar['scheme']) : '';
if (
    !$parcalar || $sema !== 'https' || !seyirGorselMebHostMu($host) ||
    !empty($parcalar['user']) || !empty($parcalar['pass']) ||
    (!empty($parcalar['port']) && (int) $parcalar['port'] !== 443)
) {
    seyirGorselHata('Yalnızca resmî HTTPS MEB görsellerine izin verilir.', 400);
}

$adresler = @gethostbynamel($host);
if ($adresler === false || count($adresler) === 0) seyirGorselHata('Görsel sunucusu çözümlenemedi.', 502);
foreach ($adresler as $ip) {
    if (!seyirGorselAcikIpMi($ip)) seyirGorselHata('Güvenli olmayan hedef adres engellendi.', 403);
}

$azamiBoyut = 8 * 1024 * 1024;
$govde = '';
$boyutAsildi = false;
$basarili = false;
$httpKod = 0;
$baglantiHatasi = '';

if (function_exists('curl_init')) {
    $ch = curl_init();
    $ayarlar = array(
        CURLOPT_URL => $url,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT => 'Seyir-Dijital-Pano/1.0',
        CURLOPT_REFERER => 'https://' . $host . '/',
        CURLOPT_HTTPHEADER => array('Accept: image/webp,image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.1'),
        CURLOPT_RESOLVE => array($host . ':443:' . $adresler[0]),
        CURLOPT_WRITEFUNCTION => function ($curl, $parca) use (&$govde, &$boyutAsildi, $azamiBoyut) {
            if (strlen($govde) + strlen($parca) > $azamiBoyut) {
                $boyutAsildi = true;
                return 0;
            }
            $govde .= $parca;
            return strlen($parca);
        }
    );
    if (defined('CURLOPT_PROTOCOLS') && defined('CURLPROTO_HTTPS')) $ayarlar[CURLOPT_PROTOCOLS] = CURLPROTO_HTTPS;
    curl_setopt_array($ch, $ayarlar);
    $basarili = curl_exec($ch);
    $httpKod = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $baglantiHatasi = curl_error($ch);
    curl_close($ch);
} elseif (ini_get('allow_url_fopen')) {
    $ctx = stream_context_create(array(
        'http' => array(
            'method' => 'GET',
            'header' => "User-Agent: Seyir-Dijital-Pano/1.0\r\n" .
                        "Referer: https://" . $host . "/\r\n" .
                        "Accept: image/webp,image/png,image/jpeg,image/gif;q=0.9,*/*;q=0.1\r\n",
            'timeout' => 25,
            'follow_location' => 0,
            'ignore_errors' => true
        ),
        'ssl' => array('verify_peer' => true, 'verify_peer_name' => true)
    ));
    $govde = @file_get_contents($url, false, $ctx, 0, $azamiBoyut + 1);
    $yanitBasliklari = isset($http_response_header) ? $http_response_header : array();
    if (!empty($yanitBasliklari[0]) && preg_match('~\s(\d{3})\s~', $yanitBasliklari[0], $kodEslesme)) {
        $httpKod = (int) $kodEslesme[1];
    }
    $boyutAsildi = is_string($govde) && strlen($govde) > $azamiBoyut;
    $basarili = is_string($govde) && !$boyutAsildi;
    if (!$basarili) $baglantiHatasi = 'PHP HTTPS akışı başarısız.';
} else {
    seyirGorselHata('Sunucuda cURL veya allow_url_fopen desteği etkin değil.', 503);
}

if ($boyutAsildi) seyirGorselHata('Görsel dosyası 8 MB sınırını aşıyor.', 413);
if ($basarili === false || $httpKod < 200 || $httpKod >= 300 || $govde === '') {
    seyirGorselHata('MEB görseli alınamadı' . ($baglantiHatasi ? ': ' . $baglantiHatasi : '.'), 502);
}

$bilgi = @getimagesizefromstring($govde);
$mime = is_array($bilgi) && !empty($bilgi['mime']) ? strtolower((string) $bilgi['mime']) : '';
$izinliTurler = array('image/jpeg', 'image/png', 'image/webp', 'image/gif');
if (!in_array($mime, $izinliTurler, true)) seyirGorselHata('Kaynak geçerli bir haber görseli değil.', 415);

header('Content-Type: ' . $mime);
header('Content-Length: ' . strlen($govde));
header('Cache-Control: public, max-age=21600, stale-while-revalidate=86400');
echo $govde;
