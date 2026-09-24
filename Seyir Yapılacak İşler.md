# 🚢 Seyir Projesi — Yapılacak İşler Listesi
> **Son Analiz Tarihi:** 17.09.2026 | **Son Güncelleme:** 17.09.2026 | **Durum:** Güvenlik/KVKK dağıtım işleri tamamlandı; planlı özellikler bekliyor

---

## ✅ Mevcut Durum Özeti

| Bileşen | Durum | Not |
|---|---|---|
| `index.html` | ✅ Kararlı | Header, mobil hamburger menü, flip-card, duyurular, ticker |
| `admin.html` + `js/local-auth.js` | ✅ Cihaz-yerel geçit | İlk kullanımda parola belirleme, PBKDF2 özeti, panelden parola değiştirme |
| `js/seyir.js` | ✅ Sözdizimi OK | Scale engine, typewriter, dini içerik, namaz geçişleri |
| `js/admin.js` | ✅ Sözdizimi OK | DnD ders/nöbet programı, kayan yazı yönetimi |
| `css/seyir.css` | ✅ Kararlı | Dark glassmorphism, mobil responsive |
| `css/admin.css` | ✅ Kararlı | Light tema (varsayılan) |
| `data/data.json` | ✅ Geçerli JSON | KVKK uyumlu sıfır-preset; şeması `data/VERI-SEMASI.md` |
| `fetch-haberler.php` | ✅ PHP Sözdizimi OK | Yalnızca POST, MEB alan adı/SSRF kontrolü, sunucuya okul verisi yazmayan JSON yanıtı |
| `lib/meb-parser.php` + `tests/` | ✅ Testli | 5 yerel MEB tema fixture'ı, ağsız regresyon testi |
| `data/dini_icerik.json` | ✅ Genişletildi | 26 ayet / 27 hadis / 27 dua |
| `tools/` | ✅ Yeni | Cache-buster ve kodlama kontrol otomasyonu |

### 🔍 Sürüm Öncesi Rutin

```bash
node tools/encoding-kontrol.js      # UTF-8 / Türkçe karakter bütünlüğü (hata → çıkış 1)
node tools/guvenlik-kontrol.js      # PIN, özel veri sızıntısı, dış betik ve bağımlılık denetimi
node tools/surum-guncelle.js        # ?v= cache-buster etiketlerini içerik hash'ine göre yenile
node tools/surum-guncelle.js --kontrol   # CI: etiketler güncel değilse çıkış 1
node --check js/local-auth.js && node --check js/seyir.js && node --check js/admin.js
node tests/local-auth-test.js
php -l fetch-haberler.php
php -l admin.php && php -l lib/meb-parser.php
php tests/meb-parser-test.php
```

### 🔐 Dağıtım Güvenliği ve KVKK Teknik Seçenekleri ✅

- Kaynak koddaki varsayılan PIN kaldırıldı. Her okul ilk kullanımda kendi bilgisayarında
  parola belirler; açık parola yerine rastgele salt ve 210.000 turlu PBKDF2 özeti tutulur.
- `fetch-haberler.php` yalnızca aynı origin POST isteği ve resmî MEB adresleriyle çalışır;
  okul URL'si, haberleri veya görselleri ortak sunucu dosyasına yazılmaz.
- Özel yönetim verisi (`seyir_admin_data`) ile açık pano kopyası (`seyir_public_data`)
  ayrıldı; pano özel anahtarı okumaz.
- Görev adı / baş harf / gizli / yerel tam ad seçenekleri ile nöbetçi, rehber ve aktif
  ders öğretmeni görünürlük anahtarları eklendi.
- Dışa aktarılan güvenli `data.json` içinde yapılandırılmış personel alanları anonimleştirilir;
  serbest metin kontrol uyarısı gösterilir. Kişisel veri içerebilen tam yedek ayrı
  `.private.json` dosyası ve belirgin uyarıyla indirilir.
- Excel işlemlerinde kullanılan SheetJS sürümü sabitlenerek yerel barındırıldı; özel
  `localStorage` verisine uzaktaki değişebilir bir betiğin erişmesi engellendi.
- Saklama süresi ve süre dolunca personel alanlarını temizleme; cihazdaki tüm Seyir
  verilerini silme işlemi eklendi.
- Apache/Nginx/HTTPS/PHP/izin/yedek kontrol listesi ve okulca uyarlanacak aydınlatma
  metni taslağı eklendi.
- `haberbant`, `pgwSlider`, `main-carousel`, `main-slider` ve `okul-haberler-slider`
  fixture testleri eklendi.

---

## 🟢 KALAN İŞLER — Planlı Yeni Özellikler

> Bunlar `SEYIR_TAVSIYE_OZELLIKLER.md` dosyasında da kayıtlı özelliklerdir.
> **Listede bekleyen tek kategori budur.**

### 3.1 — 🌐 Dinamik Okul Web Sitesi Entegrasyonu, Logo Yükleme ve Okul Adı Yönetimi ✅
- Admin panelinden okulun URL'si girildiğinde `fetch-haberler.php` dinamik olarak bu adresten haber çeker.
- **Logo Yükleme:** Admin panelinden her okulun kendi amblemini yükleyebilmesi için Base64 `FileReader` dosya seçici, canlı önizleme ve varsayılana sıfırlama seçeneği eklendi (`appData.okulLogo` / `localStorage` / `data.json`). Panoda anında güncellenir.
- **Okul Adı Yönetimi:** Admin panelinden girilen okul adı panoda ve sayfa başlığında anında güncellenir.
- **Konum Yönetimi:** Şehir, enlem ve boylam admin panelinden değiştirilebilir; hava durumu ve namaz vakitleri yeni okulun konumuna göre alınır.
- **Kontrollü Haber Yenileme:** MEB adresi değiştirildiğinde yalnızca bir otomatik istek yapılır; aynı URL için yinelenen istek engellenir. “Haberleri Şimdi Yenile” butonu sonraki manuel güncellemeler içindir. Pano scraper'ı çağırmaz; böylece yenileme döngüsü oluşmaz.
- **Teknik:** `fetch-haberler.php`, MEB alan adlarıyla sınırlı dinamik URL veya `data.json` fallback'i ile beslenir; 30 dakikalık kaynak-bazlı önbellek, eşzamanlı istek kilidi, içerik değişmediyse yazmama ve dinamik `Referer` desteği kullanır.
- **Çoklu Tema:** Eski `haberbant` ve `pgwSlider` katmanlarına ek olarak `main-carousel`, `main-slider` ve `okul-haberler-slider` tabanlı MEB temaları ortak `genel-meb-slider` ayrıştırıcısıyla desteklenir. İdil MTAL (2 haber), Selçuklu Anadolu İHL (5 haber) ve mevcut okul sitesi (5 haber) gerçek kaynaklarla doğrulandı.

### 3.2 — 🎬 Video Oynatıcı Desteği (Karusel, YouTube & MP4) ✅
- **Karusel Entegrasyonu:** Admin panelinden eklenen YouTube (standart, shorts, embed) veya doğrudan MP4 (web URL veya yerel dosya yükleme) videoları ana haber karuseli slaytlarıyla dikişsiz harmanlanır.
- **Akıllı Oynatıcı & Dinamik Zamanlayıcı:** Sabit zaman aralığı yerine dinamik slayt zamanlayıcısı geliştirildi:
  - MP4 videoları sessiz (`muted autoplay playsinline`) başlar ve video bittiğinde (`ended` olayı) otomatik sonraki slayta geçer (güvenlik zaman aşımı korumalı).
  - YouTube videoları `autoplay=1&mute=1&controls=0&playsinline=1&enablejsapi=1` parametreleriyle gömülür, slayttan çıkıldığında önceki video durdurulur/temizlenir.
- **📁 Yerel Video Yükleme (IndexedDB):** Kullanıcı yerel bilgisayarından MP4 video yükleyebilir. Dosya IndexedDB (`seyir_audio_db` / `SeyirAudioStore`) üzerinde binary `Blob` olarak saklanır ve panoda `URL.createObjectURL` ile oynatılır.
- **Admin Video Yönetim Merkezi:** Sol menüye eklenen "🎬 Video & Medya" sekmesi; Toplam Video, Aktif Yayında ve Entegrasyon KPI istatistikleri, otomatik YouTube video ID ayrıştırma ve canlı afiş (thumbnail) önizlemesi, 16:9 modal önizleme oynatıcısı, süre ayarı ve anlık aktiflik anahtarı.

### 3.3 — 📺 Ekran Koruyucu / Güç Tasarrufu Modu (Kiosk Sleep Mode) ✅
- **Otomatik Uyku & Güç Tasarrufu:** Mesai saatleri dışında (varsayılan: `17:30` - `07:30`), hafta sonlarında veya belirlenen süre boyunca hareketsiz kalındığında (15, 30, 60 dk) TV ve Akıllı Tahtalar otomatik uyku moduna geçer.
- **Piksel Yanması Koruması (OLED / LED Anti-Burn-in):** Ekran koruyucu açıkken içeriğin durağan kalıp pikselleri yıpratmasını önlemek için 45 saniyelik mikro pozisyon kaydırma animasyonu (`screensaverDrift`) ve yumuşak logo nabzı (`screensaverLogoPulse`) eklendi.
- **Zengin Bilgi Ekranı:** Koyu OLED zemin üzerinde okul logosu, okul adı, büyük neon saat (`HH:MM:SS`), tam tarih, canlı hava durumu ve sonraki vakit geri sayım kartı.
- **Akıllı Uyandırma & Geçici Uyanıklık (Grace Period):** Ekrana dokunulduğunda, fare hareketinde veya klavye tuşuna basıldığında ekran koruyucu anında gizlenir; mesai dışı saatte uyanıldığında kullanıcının işlem yapabilmesi için 3 dakikalık geçici uyanıklık süresi tanınır.
- **Admin Yönetim Kartı & Canlı Test:** Admin panelinde Genel Ayarlar altına eklenen yönetim kartı; başlangıç/bitiş saati ayarı, hafta sonu tam gün uyku anahtarı, boşta kalma süresi seçicisi ve diğer sekmedeki panoya anında test sinyali gönderen `Canlı Test Et` butonu.

### 3.4 — 🔔 Sesli & Görsel Zil Efekti, Yerel Zil Dosyası Yükleme, Tören Müzikleri ve Nöbetçi Öğretmen Vurgusu ✅
- **Web Audio Sentezleyici & Çoklu Melodi:** Harici ses dosyasına ihtiyaç bırakmayan, saf Web Audio API akorları ile 7 farklı okul melodisi (`modern`, `westminster`, `chime`, `klasik`, `marimba`, `fanfare`, `alarm`).
- **📁 Yerel Ses Dosyası Yükleme (IndexedDB):** Kullanıcı yerel bilgisayarından MP3/WAV/OGG/AAC/M4A zil seslerini Öğrenci, Öğretmen veya Çıkış ziline ya da münferit bir ders ziline özel atayabilir. Ses dosyaları `localStorage` kotasını tüketmemek için IndexedDB (`seyir_audio_db`) üzerinde binary `Blob` olarak saklanır.
- **🇹🇷 Tören & Zamanlanmış Müzikler Paneli (İstiklal Marşı, Saygı Duruşu & Fon Müzikleri):**
  - İstiklal Marşı, Saygı Duruşu sireni veya teneffüs fon müzikleri yerel bilgisayardan yüklenir.
  - İstenen gün (Pzt, Cum vb.) ve saate göre otomatik çalma programı tanımlanabilir.
  - Admin panelinden tek tıkla anlık canlı başlatma ("▶ Çal") ve durdurma ("⏹ Durdur") butonları.
  - Canlı tetikleme ve zamanlanan saat geldiğinde dijital panoda (`index.html`) isteğe bağlı tam ekran dalgalanan Türk Bayrağı ve tören bilgi kartı (`#pano-ceremony-overlay`) otomatik açılır.
- **Saniyelik Gerçek Zamanlı Motor:** Hem panoda (`seyir.js`) hem de admin panelinde (`admin.js`) çalışan saniyelik zamanlayıcı; gün ve saat kontrolü, hafta sonu sessizlik kuralı.
- **Admin Zil Yönetimi Modülü:** Sol menüye eklenen kapsamlı yönetim sekmesi, KPI istatistik kartları, tek tıkla ders saatleriyle otomatik zil oluşturma, özel zil ekleme/düzenleme, anlık canlı test ve geçmiş günlüğü.
- **Görsel Zil Dalgası & Neon Aura:** Zil çaldığında panoda zarif ambient neon çevre ışıması (`.bell-screen-glow`, `screenBellAura`) ve zil türüne göre dinamik renklenen tam genişlikli banner.
- **Teneffüste Nöbetçi Öğretmen Öne Çıkarma:** Teneffüs başladığında otomatik olarak nöbetçi paneline geçiş (`#flip-inner` flip), canlı yeşil nabız rozeti (`.nobet-active-tag`, `nobetTagPulse`, `.duty-ping`), nöbetçi kartlarında 3D yükselme ve zümrüt ışığı (`.is-teneffus-duty`), zil anında 15 saniyelik parıltı (`.bell-duty-shimmer`).
- **Admin Açma/Kapama Ayarları:** Teneffüs nöbetçi vurgusu (`nobetciVurgu`), neon görsel efekt (`neonEfekt`) ve tören ekranı admin panelinden bağımsız olarak yönetilebilir.

### 3.5 — 📱 QR Kod Entegrasyonu (Dinamik Karekod & Belge/Afiş Bağlantısı) ✅
- **Otomatik & Dinamik QR Kod Üretimi:** Duyuru veya afişe ait web bağlantısı (PDF kılavuz, form, MEB duyurusu vb.) girildiğinde, dijital panodaki duyuru kartının yanında otomatik olarak yüksek kontrastlı ve taranabilir QR Kod (`.duyuru-qr-wrapper`) oluşturulur.
- **📱 Akıllı Telefonla Anında Tarama:** Koridorda veya sınıfta TV / Akıllı Tahta ekranına bakan öğrenci, öğretmen ve veliler cep telefonu kamerasıyla QR kodu taratarak ilgili resmi belgeye, afişe veya başvuru formuna anında ulaşabilir.
- **Akıllı Tahta Dokunma Desteği:** Etkileşimli akıllı tahtalarda panodaki QR kod rozetine doğrudan dokunulduğunda bağlantı yeni sekmede açılır.
- **Admin Canlı Önizleme & Hızlı Şablonlar:** Admin panelinde duyuru formu içerisine "🔗 Bağlantı & QR Kod URL" alanı eklendi; URL girildiği anda canlı önizleme kartında mini QR kodu gerçek zamanlı render edilir. Hızlı şablonlar (DYK Kursları, TEKNOFEST, Veli Toplantısı vb.) örnek QR bağlantılarıyla zenginleştirildi.
- **📦 %100 Çevrimdışı & Yerel Bağımsızlık:** Dış CDN veya üçüncü taraf servislere ihtiyaç duymadan, doğrudan `js/vendor/qrcode.min.js` üzerinden yerel olarak çalışır; internet kesintilerinde dahi kesintisiz QR üretimi sağlanır.

### 3.6 — 🌐 Çevrimdışı Çalışma (PWA / Service Worker & Kesintisiz Yayın) ✅
- **Otomatik Service Worker (`sw.js`):** Pano kabuğu (App Shell), CSS'ler, fontlar, JS kütüphaneleri (`qrcode.min.js`, `xlsx`, `sehir-koordinat`, `audio-store`, `seyir.js`), `data.json`, `dini_icerik.json` ve `meb_haberler.json` yerel tarayıcı önbelleğine (CacheStorage) otomatik kaydedilir.
- **Hibrit Ağ & Önbellek Stratejisi (Network-First & Stale-While-Revalidate):** Veri dosyaları internet varken ağdan en güncel haliyle çekilir ve önbellek güncellenir; internet koptuğunda sıfır hata ve sıfır beyaz ekran ile anında önbellekten servis edilir.
- **Dinamik Çevrimdışı Rozeti (`#header-offline-pill`):** İnternet bağlantısı kesildiğinde panoda zarif kehribar renkli `Çevrimdışı Mod (Önbellek)` uyarısı belirir; internet geri geldiğinde yeşil `Bağlantı Kuruldu` rozetiyle veriler arka planda otomatik yenilenir.
- **Ezan Vakitleri & Hava Durumu Önbelleği:** İnternet kesilse bile günün namaz vakitleri ve son geçerli hava durumu yerel hafızadan (`localStorage`) gösterilmeye devam eder.
- **📱 PWA & Web App Manifest (`manifest.json`):** Akıllı Tahta, TV, tablet veya bilgisayarlarda bağımsız masaüstü/kiosk uygulaması gibi yüklenebilir (standalone display, tam ekran ve yatay mod uyumlu).

---

## 📋 Öncelik Özeti

| # | İş | Öncelik | Durum |
|---|---|---|---|
| 3.1 | Dinamik URL → haber entegrasyonu + Logo & Okul Adı | 🟢 Planlı | ✅ Tamamlandı |
| 3.2 | Video oynatıcı karusel | 🟢 Planlı | ✅ Tamamlandı |
| 3.3 | Ekran koruyucu modu | 🟢 Planlı | ✅ Tamamlandı |
| 3.4 | Sesli zil efekti & Teneffüs Nöbetçi Vurgusu | 🟢 Planlı | ✅ Tamamlandı |
| 3.5 | QR kod entegrasyonu | 🟢 Planlı | ✅ Tamamlandı |
| 3.6 | PWA / Service Worker | 🟢 Planlı | ✅ Tamamlandı |

---

## 🗃️ Tamamlanan İşler Arşivi

<details>
<summary><strong>🔴 Öncelik 1 — Kritik & Acil Düzeltmeler (tamamlandı)</strong></summary>

### 1.1 — cPanel'de MEB Haberleri Yüklenmiyor ✅
`fetch-haberler.php` içinde cURL → `file_get_contents` çift katmanlı fallback, User-Agent /
Referer / Accept başlıkları ve yapılandırılmış JSON hata yanıtı mevcut.
**Ek düzeltme (09.09.2026):** `tespitEtMime()` yardımcısı eklendi. Önceki kodda görsel
doğrulama yolundaki `new finfo(...)` çağrısı korumasızdı; `fileinfo` eklentisi kapalı cPanel
kurulumlarında ölümcül hata verip `error_reporting(0)` nedeniyle **boş yanıt** döndürüyordu.
Artık finfo → `getimagesizefromstring` → sihirli bayt (magic bytes) zinciri kullanılıyor.

### 1.2 — Görsel (Image) Yükleme Hatası ✅
Büyük görsel → küçük görsel → doğrulanmış uzak MEB URL'si zinciri kullanılır. Geçici
`gorsel.jpg.tmp` dosyalarında gerçek uzantının korunması sağlandı; böylece geçerli görseller
yanlışlıkla reddedilip Base64'e dönüştürülmez ve haber JSON'u gereksiz büyümez.

### 1.3 — Admin.html Varsayılan Tema Kontrolü ✅
`initAdminTheme()` IIFE; localStorage'da `dark` yoksa HTML'deki `data-theme="light"` geçerli.
</details>

<details>
<summary><strong>🟡 Öncelik 2 — Fonksiyonel İyileştirmeler (tamamlandı)</strong></summary>

### 2.1 — Ders Programında Aktif Ders Vurgusu ✅
`renderAktifDerslerUI()` + `ders-aktif-pulse` / `@keyframes ders-neon-pulse`.

### 2.2 — Namaz Vakti Geri Sayım Kararlılığı ✅
- Aladhan API saatleri `"05:47 (+03)"` biçiminde dönüyordu ve **karta ham hâliyle basılıyordu**;
  `normalizeVakitSaati()` ile `HH:MM`e indirgeniyor, bozuk yanıt gelirse eldeki vakitler korunuyor.
- Yeni vakte geçişte ve gün değişiminde `fetchNamazVakitleri()` otomatik tetikleniyor
  (`tetikleNamazYenileme`, dakikada en fazla bir istek).
- Tetikleyici **vakit indeksi değişimine** bağlandı: geri sayım `00:00:01`'den doğrudan yeni
  vakte atladığı için "sıfır anı" hiç yakalanmıyordu.
- **Uçtan uca test edildi:** vakit sınırları, saniye saniye geçiş ve gece yarısı devri doğrulandı.

### 2.3 — Duyuru Kartlarında Tarih Otomatik Sıralaması ✅
`parseTurkishDate()` + `renderDuyuruGrid()` içinde azalan sıralama.

### 2.4 — Kayan Yazı (Ticker) Admin Kontrolü ✅
Düz metin kutusunun yerine tam liste yönetimi geldi: **ekle / düzenle / sil / yukarı-aşağı sırala**,
Enter ile ekleme, sıra numarası rozetleri. Eski metin alanı "Toplu Düzenleme" başlığı altında
korundu ve listeyle **çift yönlü senkron** çalışıyor. Tüm satırlar `escapeHtml` ile basılıyor.

### 2.5 — Versiyon Numarası ✅
Artık elle değil; `tools/surum-guncelle.js` içerik hash'inden üretiyor (bkz. 4.1).
</details>

<details>
<summary><strong>🔵 Öncelik 4 — Teknik Borç & Temizlik (tamamlandı)</strong></summary>

### 4.1 — Cache-Buster Otomasyonu ✅
`tools/surum-guncelle.js`: `?v=` etiketlerini dosyanın **içerik hash'inden** üretir
(`YYYYAAGG_<md5-8>`), böylece sürüm yalnızca dosya gerçekten değiştiğinde değişir.
`--kontrol` bayrağı CI için yazmadan doğrular.

### 4.2 — `data.json` Şema Belgelendirmesi ✅
`data/VERI-SEMASI.md`: tüm üst düzey alanlar, iç içe yapılar (`dersProgramiDetay`,
`tamamlamaAtamalari`, `nobetciGunluk` biçimi), legacy alanlar ve yalnızca çalışma anında
üretilenler tablolar hâlinde belgelendi.

### 4.3 — PHP Hata Loglama ✅
`jsonHataYaniti()` ile `{durum, mesaj, kod, zaman, diagnostik, detay}` standardı ve
`error_log` kaydı. **Ek:** log dosyası `data/` altında web'den erişilebilirdi;
`data/.htaccess` ile `.log/.tmp/.bak` kapatıldı ve dizin listeleme devre dışı bırakıldı.

### 4.4 — `dini_icerik.json` İçerik Genişletme ✅
İçerik 15/15/15'ten **26/27/27**'ye çıkarıldı. Asıl tekrar nedeni ise seçim mantığıydı:
indeks `(vIdx * 3 + gün % 3) % 15` olduğu için havuzun 15'ten fazlası **hiç gösterilmiyor**,
gün döngüsü de yalnızca 3 gün sürüyordu. Artık tohum yılın gününe dayanıyor ve havuzun
tamamı kullanılıyor. Kart filtrelerinden geçen etkin içerik **7/7/9 → 18/19/21**.

### 4.5 — Encoding Kontrol Otomasyonu ✅
`tools/encoding-kontrol.js`: UTF-8 geçerliliği, BOM, kaçak kontrol karakteri,
`<meta charset>` ve çift kodlanmış karakter kalıplarını denetler; sorun varsa çıkış kodu 1.
Negatif senaryolarla (BOM'lu, charset'siz, 0x13 kontrol karakterli ve çift kodlanmış UTF-8
içeren dosyalar) gerçekten yakaladığı doğrulandı.

> Not: Denetçi, bozuk kodlama kalıplarını **metin olarak** içeren dosyaları da yakalar.
> Bu yüzden belgelerde örnek kalıp yazarken düz metin yerine tarif tercih edilmelidir.
</details>

<details>
<summary><strong>🐞 Analiz Sırasında Bulunan Ek Hatalar (tamamlandı)</strong></summary>

- **Admin paneli açılışta yarım çiziliyordu.** `renderDersler()` içindeki
  `[...appData.dersProgrami]`, varsayılan şablonda `dersProgrami` bir **nesne (`{}`)** olduğu
  için `TypeError` fırlatıyor, hata `loadData`'nın `try/catch`'i tarafından yutuluyordu.
  Sonuç: öğretmen tablosu, sınıflar, program ve sınavlar hiç çizilmiyordu.
  `Array.isArray()` kontrolleriyle düzeltildi.
- **Çizim sırası hatası.** Oturum açıkken `loadData()` DOMContentLoaded'ın ortasında senkron
  çalışıyor, ancak `renderDersler` / `renderOgretmenTable` gibi çiziciler dosyanın ilerisinde
  `window.x = function` ile atandığı için henüz tanımsız oluyordu. `populateForms` bir mikro
  görev sınırına ertelendi ve tüm çağrılar `typeof` ile korundu.
- **`updateUnassignedCount()`** `dnd-pool` öğesini korumasız okuyordu; null olması hâlinde tüm
  `populateForms` akışını kesiyordu. Guard eklendi.
- **Yinelenen DOM id.** `btn-download-json` `admin.html`'de iki kez tanımlıydı;
  `getElementById` ilkini döndürdüğü için *Veri Yönetimi* sekmesindeki indirme butonu ölüydü.
  Ortak `.btn-download-json` sınıfına taşındı.
- **Mobil menü açılamıyordu.** `toggleSeyirDrawer()` ve `.pano-header>button` CSS kuralı
  hazırdı ama hamburger butonu HTML'e hiç eklenmemişti. Buton, `aria-expanded` ve arka plan
  scroll kilidi eklendi.
- **601–768px kırılma boşluğu.** Mobil breakpoint 600px iken masaüstü koruması 769px'ten
  başlıyordu; arada mobil menü paneli masaüstü kartının içinde görünüyordu.
- **Admin üst bar aksiyon ikonları** (Tam Ekran / Tema / Bildirim / Ayarlar) için CSS ve JS
  hazırdı ama markup yoktu (kök AGENTS.md Kural 6.1). Eklendi.
- **XSS kaçışı hiç uygulanmamıştı** (Kural 4.2). `escapeHtml` `seyir.js`'te tanımlıydı ama tek
  bir yerde bile kullanılmıyordu; `admin.js`'te hiç yoktu. Her iki dosyada tüm kullanıcı girdisi
  noktalarına uygulandı. Ayrıca `escapeJsAttr` eklendi — bu aynı zamanda kesme işareti içeren
  ad/ders değerlerinin (ör. *Kur'an-ı Kerim*) `onclick` niteliklerini bozmasını engelliyor.
- **KVKK ihlali** (Kural 1.2). `admin.js` içinde 4 gerçek öğretmen ismi sabit yazılıydı
  (`defaultDiger`); üstelik baktığı bölge `zonesList`'te olmadığı için ölü koddu. Kaldırıldı.
- **Kodlama bozulması.** `css/seyir.css` ve `js/seyir.js` içinde `Ö → 0x13`, `ğ → 0x1F`,
  `ı → 1` şeklinde bozulmuş 10 yorum satırı düzeltildi.
- **Daktilo yazıları veriden okunmuyordu.** `initTypewriter()`, `await` edilmeyen
  `fetchData()`'dan hemen sonra çağrıldığı için `panoData` daima `null`'dı ve sabit liste
  kullanılıyordu.
- **Admin paneli `data/data.json`'ı hiç okumuyordu**; temiz tarayıcıda panoda veri görünürken
  admin boş açılıyor, ilk kayıtta pano verisi siliniyordu.
</details>

---

## ℹ️ Karar Bekleyen (isteğe bağlı)

- **`slogan` alanı panoda kullanılmıyor.** Admin'de düzenlenebiliyor ancak `index.html`'de
  `#pano-slogan` öğesi yok; header'da yerini daktilo efekti (`daktiloYazilari`) almış durumda.
  Sloganın nerede gösterileceği bir tasarım kararı olduğu için dokunulmadı. İstenirse
  `daktiloYazilari` boş olduğunda devreye giren yedek metin olarak bağlanabilir.

---

*Bu doküman yeni geliştirmeler eklendikçe veya maddeler tamamlandıkça güncellenmelidir.*
