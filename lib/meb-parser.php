<?php
/**
 * MEB okul sayfaları için saf HTML ayrıştırıcı.
 * Ağ erişimi ve dosya yazımı yapmaz; böylece örnek HTML'lerle test edilebilir.
 * PHP 7.2+ uyumludur.
 */

function seyirHtmlOzellikDegeri($ozellikler, $ad) {
    $desen = '~(?:^|\s)' . preg_quote($ad, '~') . '\s*=\s*(["\'])(.*?)\1~isu';
    if (!preg_match($desen, (string) $ozellikler, $eslesme)) return '';
    return html_entity_decode(trim($eslesme[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function seyirMutlakMebUrl($url, $kaynakBase) {
    $url = html_entity_decode(trim((string) $url), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    if ($url === '') return '';
    if (strpos($url, '//') === 0) return 'https:' . $url;
    if (preg_match('~^https?://~i', $url)) return preg_replace('~^http://~i', 'https://', $url);
    return rtrim($kaynakBase, '/') . '/' . ltrim($url, '/');
}

function seyirTemizHaberBasligi($deger) {
    $metin = html_entity_decode(strip_tags((string) $deger), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $metin = preg_replace('/\s+/u', ' ', $metin);
    return trim((string) $metin);
}

function seyirGenelMebSliderHaberleri($html, $kaynakBase) {
    $sonuclar = array();
    $baslangicDesenleri = array(
        '~<(?:div|section)\b[^>]*class\s*=\s*(["\'])[^"\']*\bmain-carousel\b[^"\']*\1[^>]*>~isu',
        '~<(?:div|section)\b[^>]*class\s*=\s*(["\'])[^"\']*\bmain-slider\b[^"\']*\1[^>]*>~isu',
        '~<(?:div|section)\b[^>]*class\s*=\s*(["\'])[^"\']*\bokul-haberler-slider\b[^"\']*\1[^>]*>~isu'
    );

    $baslangic = null;
    $acilisUzunlugu = 0;
    foreach ($baslangicDesenleri as $desen) {
        if (preg_match($desen, $html, $eslesme, PREG_OFFSET_CAPTURE)) {
            $aday = $eslesme[0][1];
            if ($baslangic === null || $aday < $baslangic) {
                $baslangic = $aday;
                $acilisUzunlugu = strlen($eslesme[0][0]);
            }
        }
    }
    if ($baslangic === null) return $sonuclar;

    $kalan = substr($html, $baslangic + $acilisUzunlugu);
    $bitisDeseni = '~<(?:div|section)\b[^>]*class\s*=\s*(["\'])[^"\']*(?:\bbaglantilar\b|\bduyurular\b|\bcol-xl-4\s+haberler\b|\bduyurular-slider\b)[^"\']*\1[^>]*>~isu';
    $bitis = strlen($kalan);
    if (preg_match($bitisDeseni, $kalan, $bitisEslesme, PREG_OFFSET_CAPTURE)) {
        $bitis = $bitisEslesme[0][1];
    }
    $sliderHtml = substr($kalan, 0, $bitis);

    if (!preg_match_all('~<a\b([^>]*)>(.*?)</a>~isu', $sliderHtml, $baglantilar, PREG_SET_ORDER)) {
        return $sonuclar;
    }

    $gorulenLinkler = array();
    foreach ($baglantilar as $baglanti) {
        $href = seyirHtmlOzellikDegeri($baglanti[1], 'href');
        if (!preg_match('~/icerikler/(?!icerikler/listele)[^?#]+_\d+\.html(?:$|[?#])~iu', $href)) continue;
        if (!preg_match('~<img\b([^>]*)>~isu', $baglanti[2], $gorselEslesme)) continue;

        $link = seyirMutlakMebUrl($href, $kaynakBase);
        if ($link === '' || isset($gorulenLinkler[$link])) continue;
        $gorsel = seyirMutlakMebUrl(seyirHtmlOzellikDegeri($gorselEslesme[1], 'src'), $kaynakBase);
        if ($gorsel === '') continue;

        $baslik = seyirHtmlOzellikDegeri($baglanti[1], 'title');
        if ($baslik === '') $baslik = seyirHtmlOzellikDegeri($gorselEslesme[1], 'alt');
        if ($baslik === '' && preg_match('~<[^>]+class\s*=\s*(["\'])[^"\']*\btitle\b[^"\']*\1[^>]*>(.*?)</[^>]+>~isu', $baglanti[2], $baslikEslesme)) {
            $baslik = $baslikEslesme[2];
        }
        $baslik = seyirTemizHaberBasligi($baslik);
        if ($baslik === '') continue;

        $gorulenLinkler[$link] = true;
        $sonuclar[] = array('tip' => 'slider', 'baslik' => $baslik, 'gorsel' => $gorsel, 'link' => $link);
        if (count($sonuclar) >= 12) break;
    }
    return $sonuclar;
}

function seyirMebHaberleriniAyristir($html, $kaynakBase) {
    $haberler = array();
    $ayristirici = 'yok';

    if (preg_match('/<div[^>]+id=["\']haberbant["\'][^>]*>(.*?)<\/div>\s*<div\s+id=["\']bbb["\']/si', $html, $haberbantMatch)) {
        $resimler = array();
        $yazilar = array();
        if (preg_match('/<ol[^>]+id=["\']resim["\'][^>]*>(.*?)<\/ol>/si', $haberbantMatch[1], $resimOl)) {
            preg_match_all('/<li>\s*<a\s+href="([^"]+)"[^>]*>\s*<img\s+src="([^"]+)"/si', $resimOl[1], $items, PREG_SET_ORDER);
            foreach ($items as $item) $resimler[] = array('link' => $item[1], 'gorsel' => $item[2]);
        }
        if (preg_match('/<ol[^>]+id=["\']yazi["\'][^>]*>(.*?)<\/ol>/si', $haberbantMatch[1], $yaziOl)) {
            preg_match_all('/<a\s+href="([^"]+)"[^>]*>\s*<li>(.*?)<\/li>\s*<\/a>/si', $yaziOl[1], $items, PREG_SET_ORDER);
            foreach ($items as $item) $yazilar[] = array('link' => $item[1], 'baslik' => seyirTemizHaberBasligi($item[2]));
        }
        $adet = max(count($resimler), count($yazilar));
        for ($i = 0; $i < $adet; $i++) {
            $gorsel = isset($resimler[$i]) ? seyirMutlakMebUrl($resimler[$i]['gorsel'], $kaynakBase) : '';
            $linkHam = isset($resimler[$i]) ? $resimler[$i]['link'] : (isset($yazilar[$i]) ? $yazilar[$i]['link'] : '');
            $haberler[] = array(
                'tip' => 'slider',
                'baslik' => isset($yazilar[$i]) ? $yazilar[$i]['baslik'] : 'Haber ' . ($i + 1),
                'gorsel' => $gorsel,
                'link' => seyirMutlakMebUrl($linkHam, $kaynakBase)
            );
        }
        if (count($haberler) > 0) $ayristirici = 'tema4-haberbant';
    }

    if (count($haberler) === 0 && preg_match('/<ul[^>]*class=["\'][^"\']*\bpgwSlider\b[^"\']*["\'][^>]*>(.*?)<\/ul>/si', $html, $m)) {
        preg_match_all('/<li>.*?<img\s+src="([^"]+)".*?<a\s+href="([^"]+)"[^>]*>\s*<span>(.*?)<\/span>/si', $m[1], $items, PREG_SET_ORDER);
        foreach ($items as $item) {
            $haberler[] = array(
                'tip' => 'slider',
                'baslik' => seyirTemizHaberBasligi($item[3]),
                'gorsel' => seyirMutlakMebUrl($item[1], $kaynakBase),
                'link' => seyirMutlakMebUrl($item[2], $kaynakBase)
            );
        }
        if (count($haberler) > 0) $ayristirici = 'tema5-pgwSlider';
    }

    if (count($haberler) === 0) {
        $haberler = seyirGenelMebSliderHaberleri($html, $kaynakBase);
        if (count($haberler) > 0) $ayristirici = 'genel-meb-slider';
    }

    if (preg_match('/<div[^>]+id="haber_blok"[^>]*>(.*?)<div\s+class="row">/si', $html, $m)) {
        preg_match_all('/<p[^>]*><a\s+href="([^"]+)"[^>]*>(.*?)<\/a><\/p>/si', $m[1], $items, PREG_SET_ORDER);
        foreach ($items as $item) {
            $link = seyirMutlakMebUrl($item[1], $kaynakBase);
            $var = false;
            foreach ($haberler as $haber) {
                if ($haber['link'] === $link) { $var = true; break; }
            }
            if (!$var) $haberler[] = array('tip' => 'metin', 'baslik' => seyirTemizHaberBasligi($item[2]), 'gorsel' => '', 'link' => $link);
        }
    }

    return array('haberler' => $haberler, 'ayristirici' => $ayristirici);
}

