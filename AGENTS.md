# 🤖 SEYİR — Projeye Özel Agent Çalışma Kuralları (Seyir Specific Rules)

> [!CAUTION] 🚨 ZORUNLU PROJE KURAL DOSYASI
> Yapay zeka asistanı (Agent), **`seyir`** projesinde çalışırken kök dizindeki `AGENTS.md` genel kurallarına ek olarak bu dosyada tanımlanan **Seyir Özel Mimari ve Kodlama Kuralları**na %100 uymakla yükümlüdür.

---

## 🛑 1. ZERO-SERVER VE KVKK KURALI (STRICT CLIENT-ONLY RULE)

1. **Sıfır Veritabanı Yasağı:**
   * Projeye veritabanı (MySQL, MariaDB, PostgreSQL, SQLite vb.) entegre etme teklifinde bulunulamaz.
   * Proje tamamen istemci tarafında (tarayıcıda) Vanilla JS ile çalışmaya devam edecektir.
2. **KVKK Sıfır Veri Şablonu:**
   * Kod içerisine veya `data/data.json` dosyasına gerçek kişisel veri (öğretmen isimleri, TC No, şahsi telefon vb.) eklenemez.
   * `data.json` her zaman temiz sıfır-preset (clean template) formatında tutulmalıdır.

---

## 🖥️ 2. VİZÖR VE EKAN ÖLÇEKLEME KURALI (SCALE-TO-FIT ENGINE)

1. **1920x1080 Kilitli Oran:**
   * `index.html` üzerindeki Vizör ölçekleme motorunun 16:9 (1920x1080) kilitli piksel yapısı bozulamaz.
   * TV ve Akıllı Tahta görünümlerinde kayma yaratacak ad-hoc CSS müdahalelerinden kaçınılmalıdır.

---

## 🕌 3. DİNİ İÇERİK VE ARAPÇA TİPOGRAFİ PROTOKOLÜ

1. **Arapça Hat Kısıtlaması:**
   * Arapça metin gösterimi **YALNIZCA Vaktin Ayeti** kartına özeldir. Hadis ve Dua kartlarına Arapça metin eklenemez (Sadece Türkçe mealler gösterilir).
2. **Alt Hareke Görünürlük Ayarı:**
   * Arapça tipografide alt harekelerin (esre/kesre) kırpılmaması için `line-height: 2.2` ve `padding-bottom: 8px` CSS tanımları korunmalıdır.

---

## 🎨 4. ARAYÜZ VE TEMA KURALLARI

1. **Varsayılan Tema Standardı:**
   * `admin.html` varsayılan teması KESİNLİKLE **Açık Tema (Light Mode)** olmak zorundadır (`data-theme="light"`).
2. **HTML Kaçış Güvenliği (XSS Protection):**
   * Kullanıcı girdilerinin DOM'a basıldığı yerlerde `escapeHtml` yardımcı fonksiyonu kullanılmalıdır.

---

## 🔤 5. UTF-8 ENCODING PROTOKOLÜ

* `seyir` projesindeki tüm dosyalar (`.html`, `.css`, `.js`, `.json`, `.md`, `.php`) KESİNLİKLE **UTF-8 (Without BOM)** formatında kaydedilmelidir.
* Türkçe karakterler (**ç, ğ, ı, ö, ş, ü, Ç, Ğ, İ, Ö, Ş, Ü**) bozulmadan tam korumayla yazılmalıdır.
