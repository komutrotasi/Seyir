<?php
/**
 * Seyir yönetim paneli için veritabanısız, sunucu taraflı oturum koruması.
 * Parola açık metin olarak tutulmaz; ortam değişkeninden veya yerel config
 * dosyasından yalnızca password_hash() çıktısı okunur.
 */

function seyirAdminAyarlariniOku() {
    $ayarlar = array(
        'kullanici' => getenv('SEYIR_ADMIN_USER') ?: 'admin',
        'parola_hash' => getenv('SEYIR_ADMIN_PASSWORD_HASH') ?: '',
        'oturum_suresi' => 7200
    );

    $yerelAyar = dirname(__DIR__) . '/config/admin-auth.php';
    if (is_file($yerelAyar)) {
        $dosyaAyari = require $yerelAyar;
        if (is_array($dosyaAyari)) {
            $ayarlar = array_merge($ayarlar, $dosyaAyari);
        }
    }

    $ayarlar['kullanici'] = trim((string) ($ayarlar['kullanici'] ?? 'admin'));
    $ayarlar['parola_hash'] = trim((string) ($ayarlar['parola_hash'] ?? ''));
    $ayarlar['oturum_suresi'] = max(900, (int) ($ayarlar['oturum_suresi'] ?? 7200));
    return $ayarlar;
}

function seyirGuvenliBaglantiMi() {
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') return true;
    return isset($_SERVER['HTTP_X_FORWARDED_PROTO'])
        && strtolower((string) $_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https';
}

function seyirAdminOturumunuBaslat() {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('SEYIR_ADMIN');
    session_set_cookie_params(0, '/', '', seyirGuvenliBaglantiMi(), true);
    session_start();

    if (empty($_SESSION['seyir_csrf'])) {
        $_SESSION['seyir_csrf'] = bin2hex(random_bytes(32));
    }
}

function seyirAdminYapilandirildiMi($ayarlar) {
    $hash = (string) ($ayarlar['parola_hash'] ?? '');
    $bilgi = password_get_info($hash);
    return $hash !== '' && !empty($bilgi['algo']);
}

function seyirAdminKullaniciAdiGecerliMi($kullanici) {
    return is_string($kullanici)
        && preg_match('/\A[\p{L}\p{N}._-]{3,64}\z/u', $kullanici) === 1;
}

function seyirAdminParolaHatasi($parola) {
    if (strlen((string) $parola) < 12) {
        return 'Parola en az 12 karakter olmalıdır.';
    }
    if (!preg_match('/[A-Z]/', $parola) || !preg_match('/[a-z]/', $parola)
        || !preg_match('/\d/', $parola) || !preg_match('/[^A-Za-z0-9]/', $parola)) {
        return 'Parola büyük harf, küçük harf, rakam ve özel karakter içermelidir.';
    }
    return '';
}

/**
 * Yönetici hesabını veritabanı kullanmadan yerel PHP yapılandırmasına kaydeder.
 * Açık parola bu fonksiyona verilmez; yalnızca password_hash() çıktısı yazılır.
 */
function seyirAdminAyarlariniKaydet($kullanici, $parolaHash, $yalnizYeniDosya, &$hata) {
    $hedef = dirname(__DIR__) . '/config/admin-auth.php';
    $klasor = dirname($hedef);
    $hata = '';

    if (!is_dir($klasor) || !is_writable($klasor)) {
        $hata = 'Yönetici hesabı kaydedilemedi. Sunucuda config klasörüne yazma izni verilmelidir.';
        return false;
    }

    $icerik = "<?php\n// Seyir tarafından oluşturuldu. Açık parola değil, yalnızca güvenli hash saklanır.\nreturn array(\n"
        . "    'kullanici' => " . var_export($kullanici, true) . ",\n"
        . "    'parola_hash' => " . var_export($parolaHash, true) . ",\n"
        . "    'oturum_suresi' => 7200\n);\n";

    if ($yalnizYeniDosya) {
        $dosya = @fopen($hedef, 'x');
        if ($dosya === false) {
            $hata = 'Yönetici hesabı başka bir işlem tarafından oluşturulmuş. Sayfayı yenileyin.';
            return false;
        }
        $yazildi = @fwrite($dosya, $icerik);
        @fclose($dosya);
        if ($yazildi === false || $yazildi < strlen($icerik)) {
            @unlink($hedef);
            $hata = 'Yönetici hesabı eksiksiz kaydedilemedi. Sunucu dosya izinlerini kontrol edin.';
            return false;
        }
    } else {
        $gecici = $hedef . '.tmp';
        if (@file_put_contents($gecici, $icerik, LOCK_EX) === false || !@rename($gecici, $hedef)) {
            @unlink($gecici);
            $hata = 'Yeni parola kaydedilemedi. Sunucu dosya izinlerini kontrol edin.';
            return false;
        }
    }

    @chmod($hedef, 0600);
    return true;
}

function seyirAdminDogrulandiMi($ayarlar) {
    if (empty($_SESSION['seyir_admin_dogrulandi'])) return false;

    $simdi = time();
    $sonIslem = (int) ($_SESSION['seyir_son_islem'] ?? 0);
    if ($sonIslem <= 0 || ($simdi - $sonIslem) > (int) $ayarlar['oturum_suresi']) {
        seyirAdminOturumunuKapat();
        return false;
    }

    $_SESSION['seyir_son_islem'] = $simdi;
    return true;
}

function seyirCsrfGecerliMi($deger) {
    return is_string($deger)
        && !empty($_SESSION['seyir_csrf'])
        && hash_equals((string) $_SESSION['seyir_csrf'], $deger);
}

function seyirAdminOturumunuKapat() {
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    if (session_status() === PHP_SESSION_ACTIVE) session_destroy();
}

function seyirGuvenlikBasliklari() {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: same-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.meb.k12.tr https://*.meb.gov.tr; font-src 'self' data:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self'");
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
}
