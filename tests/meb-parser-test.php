<?php
require_once dirname(__DIR__) . '/lib/meb-parser.php';

$senaryolar = array(
    array('tema4-haberbant.html', 'tema4-haberbant', 'Bilim Şenliği Başladı'),
    array('tema5-pgwslider.html', 'tema5-pgwSlider', 'Mezuniyet Törenimiz'),
    array('tema-main-carousel.html', 'genel-meb-slider', 'TEKNOFEST Başarısı'),
    array('tema-main-slider.html', 'genel-meb-slider', 'Kitap Okuma Etkinliği'),
    array('tema-okul-haberler.html', 'genel-meb-slider', 'Okullar Arası Spor Turnuvası')
);

$hata = 0;
foreach ($senaryolar as $senaryo) {
    $yol = __DIR__ . '/fixtures/' . $senaryo[0];
    $html = file_get_contents($yol);
    $sonuc = seyirMebHaberleriniAyristir($html, 'https://ornek.meb.k12.tr');
    $ilk = isset($sonuc['haberler'][0]) ? $sonuc['haberler'][0] : array();
    $basarili = $sonuc['ayristirici'] === $senaryo[1]
        && ($ilk['baslik'] ?? '') === $senaryo[2]
        && strpos((string) ($ilk['link'] ?? ''), 'https://ornek.meb.k12.tr/') === 0
        && strpos((string) ($ilk['gorsel'] ?? ''), 'https://ornek.meb.k12.tr/') === 0;
    if (!$basarili) {
        $hata++;
        fwrite(STDERR, 'BAŞARISIZ: ' . $senaryo[0] . PHP_EOL);
    } else {
        fwrite(STDOUT, 'BAŞARILI: ' . $senaryo[0] . PHP_EOL);
    }
}

if ($hata > 0) exit(1);
fwrite(STDOUT, "Tüm MEB ayrıştırıcı senaryoları başarılı.\n");

