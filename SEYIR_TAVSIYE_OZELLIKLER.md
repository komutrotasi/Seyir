# 🚀 Nexus Seyir Paneli — Tavsiye Edilen Özellikler ve Geliştirme Yol Haritası

Bu doküman, **Nexus Seyir Paneli**'nin işlevselliğini, görselliğini ve otomasyon kabiliyetini üst seviyeye taşıyacak önerilen özellikleri ve planlanan geliştirmeleri içermektedir.

## ✅ Tamamlanan Dağıtım Güvenliği (17.09.2026)

- Varsayılan istemci PIN'i kaldırıldı; veritabanısız sunucu oturumu, tarayıcıdan ilk hesap kurulumu ve panelden parola değiştirme eklendi.
- Özel yönetim verisi ile açık pano verisi ayrıldı; KVKK güvenli görünüm seçenekleri eklendi.
- Güvenli `data.json` ve uyarılı `.private.json` yedek akışları ayrıldı.
- Saklama süresi, kişisel veri temizliği, Apache/Nginx/HTTPS kurulum rehberi hazırlandı.
- Beş MEB tema yapısı yerel HTML fixture testleriyle güvenceye alındı.
- SheetJS, Font Awesome ve Arapça font yerel barındırmaya alındı.

---

## 📌 Kullanıcı Tarafından Ekelenen Özel İstekler & Fikirler

### 1. 🌐 Dinamik MEB Okul Sitesi Entegrasyonu ve Kontrollü Haber Yenileme
- **Açıklama:** Admin panelinden okulun MEB adresi güncellendiğinde haberler, kullanıcının “Haberleri Şimdi Yenile” işlemiyle (`fetch-haberler.php`) kontrollü olarak alınmalı; pano yalnızca oluşturulan JSON önbelleğini okumalıdır.
- **Teknik Detay:** Admin panelinde URL input alanı -> `pano-data.json` veya config dosyasına kayıt -> PHP scraper / API uç noktası vasıtasıyla dinamik haber akışı.

### 2. 🎬 Orta Haber Alanında Video Oynatıcı Desteği (Admin Video Linki)
- **Açıklama:** Admin panelinden haber veya duyuru için bir video linki (YouTube, MP4, Vimeo vb.) tanımlandığında veya yüklendiğinde, orta haber karusel alanı görsel yerine otomatik olarak bu videoyu oynatmalıdır.
- **Teknik Detay:** Karusel slide yapısına HTML5 `<video>` veya `<iframe>` entegrasyonu, video bittiğinde sonraki slayta otomatik geçiş veya sessiz döngü (muted autoplay) opsiyonu.

---

## 💡 Sistem & Tasarım Tavsiyeleri (Roadmap)

### 3. 📺 Akıllı Tahta & TV Otomatik Modları (Kiosk & Auto-Start)
- **Ekran Koruyucu / Güç Tasarrufu:** Okul çıkış saatlerinden sonra (örn: 17:00 sonrası) panelin amblemli ve saat vurgulu şık bir koruyucu moduna geçmesi.
- **Tam Ekran Hatırlatıcı:** Pano ilk açıldığında TV / Akıllı Tahta çözünürlüğüne otomatik uyarlanma.

### 4. 🔔 Sesli & Görsel Zil / Anons Entegrasyonu
- **Zil Uyarı Efekti:** Ders giriş/çıkış saniyelerinde tatlı bir sesli uyarı veya ekranda neon parlama efekti.
- **Nöbetçi Öğretmen Öne Çıkarma:** Teneffüs başladığında ilgili katın nöbetçi öğretmen kartının dikey olarak hafifçe öne vurgulanması.

### 5. 🌐 Çevrimdışı Çalışma Desteği (Offline PWA & Local Cache)
- **Kesintisiz Yayın:** İnternet bağlantısı koptuğunda ders programı, nöbetçi öğretmenler ve namaz vakitlerinin son kaydedilen verilerle ekranda çalışmaya devam etmesi.

### 6. 📱 Mobil / Okut-Oku QR Kod Entegrasyonu
- **Duyuru QR Kodları:** Duyuruların ve sınav ilanlarının yanında, öğrencilerin akıllı telefonlarıyla okutup detaylı dokümana (PDF/Afiş) ulaşabileceği dinamik QR kod alanı.

---
*Not: Bu doküman yeni fikir ve geliştirmeler eklendikçe güncellenebilir.*
