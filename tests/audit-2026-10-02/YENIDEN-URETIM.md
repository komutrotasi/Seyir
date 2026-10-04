**2 Ekim 2026 denetim kanıtları**

Bu klasör uygulamayı düzeltmez. `sonuclar.json`, raporlanan commit üzerinde alınmış denetim sonuçlarını içerir. Betikler izole, geçici Chrome profillerinde sentetik kayıtlar oluşturur; mevcut kullanıcı profiline bağlanmaz. XSS doğrulaması yalnızca bir `window` işaretçisi yazar. Gerçek ağdaki hedeflere güvenlik denemesi yapılmaz.

Önkoşullar: Python 3, PHP, Chrome/Chromium ve ayrı Python ortamında Playwright. Uygulamanın çalışma bağımlılıkları değişmez.

Proje kökünde bir terminalde:

```bash
php -S 127.0.0.1:18765 -t .
```

Başka terminalde:

```bash
python3 -m venv /tmp/seyir-audit-venv
/tmp/seyir-audit-venv/bin/pip install playwright
/tmp/seyir-audit-venv/bin/python tests/audit-2026-10-02/tarayici-denetimi.py
/tmp/seyir-audit-venv/bin/python tests/audit-2026-10-02/veri-yasam-dongusu-denetimi.py
```

Gerekirse `SEYIR_AUDIT_CHROME` ile tarayıcı yolu, `SEYIR_AUDIT_URL` ile **yerel test kopyasının** adresi ayarlanabilir. `SEYIR_AUDIT_OUTPUT` çıktı dosyasını değiştirir. Varsayılan çıktılar `/tmp/seyir-deep-results.json` ve `/tmp/seyir-extra-results.json` dosyalarıdır. Aynı çıktı yolunu iki koşuda kullanmak önceki dosyayı ezer.

Betikler birer bulgu toplayıcıdır; güvenlik kapısı şeklinde başarı/başarısızlık exit kodu üretmez. Hata varlığı JSON değerleri ve konsol kayıtlarıyla değerlendirilmelidir. Dış HTTPS istekleri bilinçli engellenir; dış API başarısını test etmezler. Chrome sandbox seçeneği bu izole denetim ortamı için devre dışıdır; bu bayrak normal okul tarayıcısı başlatma önerisi değildir.

Beklenen sorun göstergeleri:

| Alan | İncelenen sürümde sonuç |
|---|---|
| `browser.class_xss` | `true`: sınıf düğmesi test kodunu çalıştırıyor |
| `lifecycle.automatic_import_xss` | `true`: otomatik yedek saat alanı test kodunu çalıştırıyor |
| `browser.import_xss.executed` | `false`: ilk senaryoda ilgisiz eksik ders havuzu hatası render'ı erken durduruyor; ikinci betik geçerli boş havuz alanlarıyla aynı yolu tamamlıyor |
| `browser.privacy_projection.privateMarkerPresent` | `true`: özel snapshot açık çıktıda kalıyor |
| `browser.pano_runtime_errors` | `panoData is not defined` |
| `browser.tabs` | Program sekmesinde tanımsız ders havuzu hatası |
| `browser.offline_clean.mainLoaded` | `undefined`: sürümlü ana betik offline bulunamıyor |
| `browser.bad_import.savedAnnouncements` | `42`: hatalı tip kalıcı yazılıyor |
| `browser.clear_all.audioSurvives` / `cacheSurvives` | `true` |
| `lifecycle.expired_session.savedAfterExpiry` | `true` |
| `lifecycle.backup_media` | Referans var, medya içeriği yok |
| `lifecycle.retention_history.historyStillContainsMarker` | `true` |

`browser.non_atomic_save` testinde ikinci depolama yazımı kontrollü hata verir; gerçek disk/kota doldurulmaz. `browser.offline_clean.cssLoaded` yalnızca stylesheet nesnesinin varlığını ölçer; CSS içeriğinin başarıyla geldiğini kanıtlamaz. Offline bulgusu ana JS'in çalışmaması, ağ hataları ve sürümlü cache anahtarının yokluğuna dayanır.

Mevcut proje kontrolleri ayrıca şu şekilde yeniden çalıştırılabilir:

```bash
node tools/encoding-kontrol.js
node tools/guvenlik-kontrol.js
node tools/surum-guncelle.js --kontrol
node tests/local-auth-test.js
php tests/meb-parser-test.php
```

PHP/JS sözdizimi, yerel HTTP yöntem/alan adı reddi, 13. istekte hız sınırı ve manifest görsel boyutları raporda ayrıca kaydedilmiştir. Canlı siteye yapılan üç olağan GET'in 403 sonuçları yalnızca bu ortamın erişim gözlemidir.
