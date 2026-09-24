# 🚀 Nexus Seyir Paneli — Tavsiye Edilen Özellikler ve Geliştirme Yol Haritası

Bu doküman, **Nexus Seyir Paneli**'nin işlevselliğini, görselliğini ve otomasyon kabiliyetini üst seviyeye taşıyacak önerilen özellikleri ve planlanan geliştirmeleri içermektedir.

## ✅ Tamamlanan Dağıtım Güvenliği (17.09.2026)

- Varsayılan PIN kaldırıldı; her okul bilgisayarı için ilk kullanımda PBKDF2 özetli yerel parola kurulumu ve panelden parola değiştirme eklendi.
- Özel yönetim verisi ile açık pano verisi ayrıldı; KVKK güvenli görünüm seçenekleri eklendi.
- Güvenli `data.json` ve uyarılı `.private.json` yedek akışları ayrıldı.
- Saklama süresi, kişisel veri temizliği, Apache/Nginx/HTTPS kurulum rehberi hazırlandı.
- Beş MEB tema yapısı yerel HTML fixture testleriyle güvenceye alındı.
- SheetJS, Font Awesome ve Arapça font yerel barındırmaya alındı.

---

## 📌 Kullanıcı Tarafından Ekelenen Özel İstekler & Fikirler

### 1. 🌐 Dinamik MEB Okul Sitesi Entegrasyonu ve Kontrollü Haber Yenileme
- **Açıklama:** Admin panelinden okulun MEB adresi değiştirildiğinde haberler tek bir kontrollü istekle (`fetch-haberler.php`) otomatik alınmalı; sonraki güncellemeler “Haberleri Şimdi Yenile” ile yapılmalı ve pano yalnızca cihaz-yerel açık veriyi okumalıdır.
- **Teknik Detay:** Admin panelinde URL input alanı -> `pano-data.json` veya config dosyasına kayıt -> PHP scraper / API uç noktası vasıtasıyla dinamik haber akışı.

### 2. 🎬 Orta Haber Alanında Video Oynatıcı Desteği (YouTube & MP4) ✅
- **Açıklama:** Admin panelinden video linki (YouTube, shorts, embed veya doğrudan MP4 URL) tanımlandığında veya yerel bilgisayardan MP4 dosyası yüklendiğinde, orta haber karuseli görsel yerine otomatik olarak bu videoyu oynatır.
- **Teknik Detay:** Karusel slayt yapısına video tipi eklendi. YouTube için `iframe` API parametreli gömme, MP4 için HTML5 `<video playsinline muted>` desteği sağlandı. Slayt geçişleri akıllı zamanlayıcı ile yönetilir; video tamamlandığında otomatik sonraki slayta geçer, slayttan ayrılınca video durdurulur ve güvenli zaman aşımı uygulanır. Yerel MP4 yüklemeleri IndexedDB (`SeyirAudioStore`) binary blob deposunda saklanır.

---

## 💡 Sistem & Tasarım Tavsiyeleri (Roadmap)

### 3. 📺 Akıllı Tahta & TV Otomatik Modları (Kiosk & Auto-Start)
- **Ekran Koruyucu / Güç Tasarrufu Modu (Kiosk Sleep Mode) ✅:** Mesai çıkış saatleri (varsayılan: 17:30 - 07:30), hafta sonları veya hareketsizlik süresi dolduğunda TV/panoyu otomatik uykuya geçirme; OLED yanma korumalı anti-burn-in drift animasyonu, neon saat, logo, hava durumu ve namaz geri sayımı; dokunma ile anında uyanma ve 3 dk geçici uyanıklık toleransı; admin panelinden tam yönetim ve canlı test.
- **Tam Ekran Hatırlatıcı:** Pano ilk açıldığında TV / Akıllı Tahta çözünürlüğüne otomatik uyarlanma.

### 4. 🔔 Sesli & Görsel Zil / Anons Entegrasyonu, Yerel Zil Dosyası Yükleme ve Tören Müzikleri Yayını ✅
- **Gerçek Zamanlı Zil Motoru & Web Audio:** Harici MP3 dosyası gerektirmeyen, Web Audio API osilatörleriyle oluşturulmuş 7 farklı akor/melodi (Modern Okul Melodisi, Westminster Çanı, Kristal Chime, Klasik Zil, Marimba, Fanfar, Acil Durum Sireni).
- **📁 Yerel Ses Dosyası ile Zil Değiştirme (IndexedDB Motoru):** Kullanıcı bilgisayarından MP3/WAV/OGG ses dosyalarını yükleyerek varsayılan öğrenci, öğretmen veya çıkış zillerini ya da belirli bir ders zilini özelleştirebilir. Büyük ses dosyaları `localStorage` kotasını aşmamak için IndexedDB (`seyir_audio_db`) üzerinde güvenle barındırılır.
- **🇹🇷 Tören & Zamanlanmış Müzik Yayını (İstiklal Marşı & Saygı Duruşu):**
  - Pazartesi İstiklal Marşı, Cuma kapanış töreni, 10 Kasım Saygı Duruşu sireni veya teneffüs müzikleri yerel bilgisayardan yüklenir.
  - İstenen gün ve saat seçilerek zamanlanmış otomatik çalma sağlanır.
  - Canlı anlık tetikleme ("▶ Çal") ve durdurma ("⏹ Durdur") imkânı.
  - Çalma esnasında dijital panoda (`index.html`) tam ekran dalgalanan Türk Bayrağı ve tören bilgi kartı animasyonu (`#pano-ceremony-overlay`) görüntülenebilir.
- **Zamanlayıcı & Otomatik Çizelge Eşleme:** Saniyelik gerçek zamanlı kontrol motoru; tek tıkla okul ders saatlerinden öğrenci giriş, öğretmen hazırlık ve teneffüs/çıkış zillerini otomatik oluşturma.
- **Canlı Görsel Neon Işık Dalgası:** Zil çaldığında panoda zarif ambient neon çevre ışıması (`.bell-screen-glow`, `screenBellAura`) ve zil türüne göre dinamik renklenen tam genişlikli üst bildirim banner'ı.
- **Teneffüste Nöbetçi Öğretmenleri Öne Çıkarma:**
  - Teneffüs başladığı anda ön/arka yüz kartı otomatik olarak **Nöbetçi Öğretmenler** paneline çevrilir (`#flip-inner` flip).
  - Başlıkta canlı yeşil nabız rozeti (`.nobet-active-tag`, `nobetTagPulse`, `.duty-ping`) devreye girer.
  - Nöbetçi öğretmen kartları 3D yükselme ve zümrüt yeşili çevre ışıması (`.is-teneffus-duty`, `translateY(-2px) scale(1.018)`) kazanır.
  - Kartlarda canlı "🟢 NÖBETTE" rozeti ve zil anında 15 saniyelik ışıltı dalgası (`.bell-duty-shimmer`, `nobetciCardShimmer`) belirir.
- **Yönetim Paneli & Kişiselleştirme:** Admin zil yönetiminden ses düzeyi, melodi türleri, çalma süresi, hafta sonu sessizliği, Web Speech Türkçe sesli anons, teneffüs nöbetçi vurgusu, neon görsel efekt ve tören ekranı ayrı ayrı açılıp kapatılabilir.

### 5. 🌐 Çevrimdışı Çalışma Desteği (Offline PWA & Local Cache) ✅
- **Kesintisiz Yayın & Service Worker:** İnternet bağlantısı koptuğunda ders programı, nöbetçi öğretmenler, duyurular, hava durumu ve namaz vakitlerinin Service Worker önbelleği ve `localStorage` ile ekranda kesintisiz çalışmaya devam etmesi; dinamik çevrimdışı rozeti ve `manifest.json` PWA desteği.

### 6. 📱 Mobil / Okut-Oku QR Kod Entegrasyonu ✅
- **Duyuru QR Kodları:** Duyuruların ve afişlerin yanında, öğrencilerin ve velilerin akıllı telefonlarıyla okutup detaylı dokümana (PDF/Afiş/Form/Kılavuz) anında ulaşabileceği %100 yerel ve dinamik QR kod alanı. Akıllı tahtalarda tek dokunuşla yeni sekmede açılma imkânı. Admin panelinde canlı QR kod önizlemesi ve örnek şablonlar.

---
*Not: Bu doküman yeni fikir ve geliştirmeler eklendikçe güncellenebilir.*
