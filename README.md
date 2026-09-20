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
* **Görsel Anonslar & Acil Durum:** Kayan yazı ve tam ekran acil durum/kutlama bannerları.
* **Günün Zaman Çizelgesi:** Anlık ders, teneffüs veya öğle arası durumunu gösteren canlı durum rozeti.

### 2. 👨‍🏫 Nöbetçi Öğretmen & İdari Bilgiler
* **Günlük Nöbet Çizelgesi:** Kat, bahçe ve bina bazında nöbetçi idareci ve öğretmenlerin otomatik listelenmesi.
* **Tarih & Saat:** Büyük fontlu dijital saat, takvim ve hicri gün bilgisi.

### 3. 🌦️ Canlı Veri Akışı ve Bilgilendirme
* **Hava Durumu:** Open-Meteo API entegrasyonuyla konum bazlı anlık sıcaklık ve hava durumu simgeleri.
* **Vakit Bilgisi:** AlAdhan API ile anlık namaz ve ezan vakitleri gösterimi.
* **Günün Sözü & Tarihte Bugün:** Her gün otomatik yenilenen edebi sözler ve tarihi olaylar.
* **MEB & Kurum Haberleri:** Farklı MEB temalarını okuyabilen haber köprüsü (`fetch-haberler.php`) ve yazmasız görsel aracısı (`fetch-gorsel.php`).

### 4. 🖥️ Akıllı Tahta & TV 16:9 Uyumluluğu
* **Akıllı Ölçekleme (`#pano-scale-wrapper`):** 1080p, 4K veya farklı ekran çözünürlüklerinde bozulmadan otomatik tam ekran uyumu.
* **Pardus ETAP ve Windows Uyumlu:** Pardus yüklü akıllı tahtalarda ve koridor televizyonlarında tarayıcı tam ekran (F11) modunda kesintisiz çalışır.

### 5. 🔐 Yönetim Paneli & Güvenlik
* **Yönetim Paneli (`admin.html`):** İlk kullanımda cihaz-yerel parola belirleyerek nöbetçi listesi, duyurular, kutlama mesajları ve zil saatlerini yönetebileceğiniz modern arayüz.
* **KVKK ve Güvenlik Standartları:** Dahili `KURULUM-GUVENLIK-KONTROL-LISTESI.md` ve `KVKK-AYDINLATMA-SABLONU.md` ile mevzuata tam uyumluluk.

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
python3 -m http.server 8080
# veya
npx serve .

# 3. Tarayıcıda açın
http://localhost:8080
```

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
