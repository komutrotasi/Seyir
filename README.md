# 📺 SEYİR — Okulun Dijital Nabzı & Akıllı Pano TV

[![Canlı Yayın](https://img.shields.io/badge/Canlı%20Yayın-seyir.komutrotasi.com-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)](https://seyir.komutrotasi.com)
[![TV / SmartBoard](https://img.shields.io/badge/Ekran-Akıllı%20Tahta%20%26%20TV%2016%3A9-emerald?style=for-the-badge)](https://seyir.komutrotasi.com)
[![License: MIT](https://img.shields.io/badge/Lisans-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Ekosistem-Komut%20Rotası-orange?style=for-the-badge)](https://komutrotasi.com)

> *"Okulun Dijital Nabzı, Bilginin Canlı Ekranı"*

**Seyir**, eğitim kurumlarının koridorlarını, bekleme salonlarını ve akıllı tahtalarını dinamik birer bilgi merkezine dönüştüren yeni nesil dijital okul panosu ve TV ekran sistemidir. Canlı ders zili bildirimleri, görsel anons bannerları, dinamik nöbetçi öğretmen çizelgesi, anlık hava durumu ve kurum içi duyuruları kesintisiz ve şık bir arayüzle sunar.

---

## 🌟 Öne Çıkan Özellikler

### 1. 🔔 Canlı Ders Zili & Görsel Anons Sistemi
* **Dinamik Ders Zili Bildirimi:** Okul zil saatleriyle senkronize açılan görsel pop-up kartı ("Ders Zili Çaldı!").
* **Görsel Bildirimler:** Kayan yazı, zil bildirimi ve tören katmanı. Merkezi acil yayın yönetimi bulunmaz.
* **Günün Zaman Çizelgesi:** Anlık ders, teneffüs veya öğle arası durumunu gösteren canlı durum rozeti.

### 2. 👨‍🏫 Nöbetçi Öğretmen & İdari Bilgiler
* **Günlük Nöbet Çizelgesi:** Kat, bahçe ve bina bazında nöbetçi idareci ve öğretmenlerin otomatik listelenmesi.
* **Tarih & Saat:** Büyük fontlu dijital saat, takvim ve hicri gün bilgisi.

### 3. 🌦️ Canlı Veri Akışı ve Bilgilendirme
* **Hava Durumu:** Open-Meteo API entegrasyonuyla konum bazlı anlık sıcaklık ve hava durumu simgeleri.
* **Vakit Bilgisi:** AlAdhan API ile anlık namaz ve ezan vakitleri gösterimi.
* **Dini İçerik ve Metinler:** Yerel ayet/hadis/dua havuzu ve yönetilebilir kayan yazılar. Bağımsız günlük tarih/söz servisi bulunmaz.
* **MEB & Kurum Haberleri:** Farklı MEB temalarını okuyabilen haber köprüsü (`fetch-haberler.php`) ve yazmasız görsel aracısı (`fetch-gorsel.php`).

### 4. 🖥️ Akıllı Tahta & TV 16:9 Uyumluluğu
* **Akıllı Ölçekleme (`#pano-scale-wrapper`):** 1080p, 4K veya farklı ekran çözünürlüklerinde bozulmadan otomatik tam ekran uyumu.
* **Pardus ETAP ve Windows Uyumlu:** Pardus yüklü akıllı tahtalarda ve koridor televizyonlarında tarayıcı tam ekran (F11) modunda kesintisiz çalışır.

### 5. 🔐 Yönetim Paneli & Güvenlik
* **Yönetim Paneli (`admin.html`):** İlk kullanımda cihaz-yerel parola belirleyerek nöbetçi listesi, duyurular, kutlama mesajları ve zil saatlerini yönetebileceğiniz modern arayüz.
* **KVKK ve Güvenlik Standartları:** Dahili `KURULUM-GUVENLIK-KONTROL-LISTESI.md` ve `KVKK-AYDINLATMA-SABLONU.md` teknik kontrol ve aydınlatma şablonlarıdır; hukuki uyum garantisi değildir.

---

## 🛠️ Teknoloji Yığını

* **Ön Yüz:** Semantic HTML5, CSS3 Grid/Flexbox mimarisi, Vanilla JavaScript
* **Arka Yüz:** Yalnızca MEB haberlerini ve görsellerini anlık ileten hafif PHP aracıları. Okula özgü veri sunucuda saklanmaz.
* **İkonlar:** Yerel FontAwesome 6 (İnternet bağlantısı kopsa dahi CDN gerektirmeyen yerel font kütüphanesi)
* **Tasarım:** Akıllı Tahta ve TV için yüksek kontrastlı modern açık tema

---

## 🚀 Yerel Kurulum ve Çalıştırma

### Yöntem A: Statik Arayüz Önizlemesi
```bash
# 1. Depoyu klonlayın
git clone git@github.com:komutrotasi/seyir.git
cd seyir

# 2. Yerel HTTP sunucusu açın
python3 -m http.server 8080 --bind 127.0.0.1

# 3. Tarayıcıda açın
http://127.0.0.1:8080
```

Bu statik önizleme komutu `.htaccess` uygulamaz; yalnızca loopback üzerinde kullanın.
Gizli dosyaları da engelleyen yerel başlatma için Yöntem B tercih edilir.

Bu yöntem başlangıç panosunu ve yerel yönetim özelliklerini gösterir; PHP çalışmadığı için
“Haberleri Şimdi Yenile” kullanılamaz. Haber yenilemesini sınamak için aşağıdaki PHP
yöntemini veya canlı alan adını kullanın.

### Yöntem B: PHP / cPanel / Sunucu Kurulumu

Windows'ta proje klasöründeki `BASLAT-SEYIR.bat` dosyasına çift tıklayın. Linux/Pardus'ta:

```bash
./baslat-seyir.sh
```

Ardından `http://127.0.0.1:8000` adresini kullanın. `127.0.0.1:5501` adresini açan
VS Code Live Server PHP çalıştırmadığı için haber yenileme bu adreste kullanılamaz.

---

## 📁 Proje Dizin Yapısı

```text
seyir/
├── index.html                     # Ana Pano TV ekranı
├── admin.html / admin.php         # Pano içerik yönetim paneli
├── fetch-haberler.php             # MEB haberleri çekme servisi
├── fetch-gorsel.php               # MEB görsellerini yazmadan ileten güvenli aracı
├── CNAME                          # seyir.komutrotasi.com yönlendirmesi
├── css/                           # Pano ve ikon stilleri (seyir.css, fontawesome)
├── js/                            # Canlı saat, zil, hava durumu mantığı
├── img/                           # Logolar, hava durumu ikonları ve görseller
├── data/                          # Nöbetçi, anons ve pano JSON veri dosyaları
├── config/                        # Güvenlik ve auth şablonları
└── tools/                         # Sürüm güncelleme ve bakım araçları
```

---

## 🌐 Canlı Yayın ve Bağlantılar

* **Canlı Pano:** [seyir.komutrotasi.com](https://seyir.komutrotasi.com)
* **Merkezi Portal:** [nexus.komutrotasi.com](https://nexus.komutrotasi.com)
* **Geliştirici:** [Komut Rotası](https://github.com/komutrotasi)

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında korunmaktadır.


## Veri, yedek ve çalışma sınırları

- İlk kurulum nötr, boş şablondur; örnek personel ve kuruma ait haber eklenmez.
- Açık pano JSON'u yalnızca izin verilen alanları içerir. Serbest metin ve görselleri paylaşmadan önce kurum kontrol etmelidir.
- **Tam özel yedek** (sürüm 2), yapılandırmayla birlikte başvurulan yerel ses/video dosyalarını ve SHA-256 bütünlük özetlerini içerir. Özetler imza veya şifreleme değildir. Yedek 128 MB medya, 5 MB yapılandırma sınırına tabidir.
- Eski JSON yedekleri, başvurdukları medya bu cihazda mevcutsa alınabilir. Medya yoksa açık hata verilir; eksik yedek başarılı sayılmaz.
- **Cihaz içi geçmiş**, en fazla 5 yapılandırma anlık görüntüsüdür. Medyayı kopyalamaz; cihaz kaybına karşı yedek değildir. Başka cihaza geçmeden tam yedeği indirin.
- Özel ve açık yerel kayıt toplamı 4 MB ile sınırlıdır. Kota hatasında önceki kayıt geri yüklenir. Tarayıcının aniden kapanması/güç kesilmesi için iki depolama sistemi arasında tam işlem garantisi yoktur.
- Personel saklama süresi ilk kayıt/son otomatik temizleme tarihinden hesaplanır. İlgisiz kayıtlar süreyi uzatmaz. Süre dolunca personel alanları ve yapılandırma geçmişi temizlenir; dışarı indirilmiş dosyalar otomatik silinemez.
- Yerel yönetici oturumu 2 saattir; açık panel de süre dolunca kilitlenir. Bu kilit, işletim sistemine veya geliştirici araçlarına erişimi olan kişiye karşı bir güvenlik sınırı değildir.
- Otomatik yedekleme için yönetim paneli açık ve oturum geçerli olmalıdır. Tarayıcı indirme/klasör izinleri gerekir; cihaz kapalıyken çalışmaz.
- İlk başarılı çevrimiçi kurulumdan sonra uygulama kabuğu çevrimdışı açılır. YouTube ve canlı haber/API erişimi internet gerektirir. Vakit yalnızca aynı gün/konum için; hava kaydı yalnızca aynı konumda en fazla 2 saat kullanılabilir.
- Zil sesi tarayıcının ses iznine, cihazın uyanık kalmasına ve hoparlöre bağlıdır. Eşzamanlı açık birden fazla zil sekmesi aynı anda ses verebilir; cihazda tek aktif zil ekranı kullanın.
- Yeni sürüm için açık Seyir sekmelerini kapatıp yeniden açın. Çalışan pano ortasında Service Worker zorla değiştirilmez.

## Doğrulama

`node tools/surum-guncelle.js` ile varlık sürümlerini güncelledikten sonra `python3 tools/test-runner.py` çalıştırın. Tarayıcı testleri için Python Playwright ve Chrome/Chromium gerekir. Testler geçici tarayıcı profilleri ve loopback test sunucusu kullanır. Tarihsel bulgular, düzeltme kanıtları ve güncel mimari ayrıntılar birleştirilmiş [tam analiz ve proje raporunda](SEYIR_TAM_ANALIZ_VE_PROJE_RAPORU.md) bulunur.

API sözleşmeleri: [AlAdhan](https://aladhan.com/prayer-times-api), [Open-Meteo](https://open-meteo.com/en/docs). Projenin mevcut MIT beyanına karşılık gelen metin `LICENSE` dosyasına eklenmiştir; üçüncü taraf font/ikon/kütüphaneler kendi lisanslarına tabidir ([MIT metin kaynağı](https://opensource.org/license/mit)).
