<?php
/**
 * Seyir HTTP uç noktaları için küçük, bağımlılıksız hız sınırı yardımcısı.
 * APCu varsa belleği, yoksa sistemin geçici dizininde kilitli bir sayaç kullanır.
 * Sayaçlarda yalnızca istemci IP adresinin SHA-256 özeti tutulur.
 */

function seyirHizSiniriniAsiyorMu($alan, $limit, $pencere) {
    $limit = max(1, (int) $limit);
    $pencere = max(1, (int) $pencere);
    $istemciOzeti = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'bilinmeyen'));
    $guvenliAlan = preg_replace('/[^a-z0-9_-]/i', '_', (string) $alan);
    $simdi = time();

    if (function_exists('apcu_fetch') && filter_var((string) ini_get('apc.enabled'), FILTER_VALIDATE_BOOLEAN)) {
        $anahtar = 'seyir_' . $guvenliAlan . '_' . $istemciOzeti;
        $mevcut = apcu_fetch($anahtar, $bulundu);
        if (!$bulundu) {
            apcu_add($anahtar, 1, $pencere);
            return false;
        }
        $yeni = apcu_inc($anahtar, 1, $basarili);
        return $basarili && (int) $yeni > $limit;
    }

    $yapilandirmaDizini = getenv('SEYIR_RATE_LIMIT_DIR');
    $geciciKok = $yapilandirmaDizini !== false && $yapilandirmaDizini !== ''
        ? $yapilandirmaDizini
        : sys_get_temp_dir();
    $geciciDizin = rtrim((string) $geciciKok, DIRECTORY_SEPARATOR);
    $dosya = $geciciDizin . DIRECTORY_SEPARATOR . 'seyir_' . $guvenliAlan . '_rate_limit.json';
    $akim = @fopen($dosya, 'c+');
    if ($akim === false) return true; // Sayaç korunamıyorsa güvenli biçimde reddet.
    @chmod($dosya, 0600);

    if (!@flock($akim, LOCK_EX)) {
        fclose($akim);
        return true;
    }

    $durum = @fstat($akim);
    if (is_array($durum) && isset($durum['size']) && (int) $durum['size'] > 2 * 1024 * 1024) {
        flock($akim, LOCK_UN);
        fclose($akim);
        return true;
    }

    rewind($akim);
    $kayitlar = json_decode((string) stream_get_contents($akim), true);
    if (!is_array($kayitlar)) $kayitlar = array();

    foreach ($kayitlar as $ozet => $kayit) {
        if (!is_array($kayit) || (int) ($kayit['sifirla'] ?? 0) <= $simdi) unset($kayitlar[$ozet]);
    }

    if (!isset($kayitlar[$istemciOzeti])) {
        $kayitlar[$istemciOzeti] = array('adet' => 1, 'sifirla' => $simdi + $pencere);
    } else {
        $kayitlar[$istemciOzeti]['adet'] = (int) ($kayitlar[$istemciOzeti]['adet'] ?? 0) + 1;
    }
    $sinirAsildi = (int) $kayitlar[$istemciOzeti]['adet'] > $limit;

    rewind($akim);
    ftruncate($akim, 0);
    $yazildi = fwrite($akim, json_encode($kayitlar)) !== false;
    fflush($akim);
    flock($akim, LOCK_UN);
    fclose($akim);

    return !$yazildi || $sinirAsildi;
}
