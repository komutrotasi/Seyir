# 📦 Seyir — `data.json` Veri Şeması

> **Madde 4.2** kapsamında hazırlanmıştır.
> JSON standardı yorum satırı desteklemediği için alan açıklamaları bu dosyada tutulur.

`data.json`, panonun (`index.html`) okuyabildiği **açık ve dağıtılabilir pano verisidir**.
Admin panelinin (`admin.php`) tam yönetim verisi bundan ayrıdır:

- **`localStorage['seyir_admin_data']`:** Öğretmen ve program ayrıntılarını içerebilen özel yönetim alanı. Pano bunu okumaz.
- **`localStorage['seyir_public_data']`:** Gizlilik seçenekleri uygulanarak üretilen yerel pano kopyası.
- **`data/data.json`:** “Güvenli data.json İndir” işlemiyle üretilen, sunucuya yüklenebilir açık dosya.
- **`*.private.json`:** Tam yönetim yedeği. Kişisel veri içerebilir ve web sunucusuna yüklenemez.

> [!IMPORTANT]
> **KVKK (AGENTS.md Kural 1.2):** `data.json` her zaman temiz/açık pano biçiminde tutulur.
> Yapılandırılmış öğretmen alanlarına gerçek ad, TC No, telefon vb. kişisel veri yazılamaz.
> “Tam ad” yerel pano için seçilmiş olsa bile dosya dışa aktarımında adlar en fazla baş
> harfe indirilir. Duyuru ve kayan yazı gibi serbest metinler otomatik tanınamayacağı için
> dışa aktarmadan önce okul tarafından kontrol edilmelidir.

---

## 🔑 Üst Düzey Alanlar

| Alan | Tip | Yazan | Okuyan | Açıklama |
|---|---|---|---|---|
| `okulAdi` | `string` | admin | pano | Header'daki okul adı. Pano bunu iki satıra böler (ana isim / alt isim). |
| `okulLogo` | `string` | admin | pano | Okulun özel logosu/amblemi (Base64 Data URI veya dosya yolu). Boşsa `img/okul_logo.png` kullanılır. |
| `slogan` | `string` | admin | — | Admin'de düzenlenir. *Panoda şu an karşılığı yoktur* (header'da yerini `daktiloYazilari` almıştır). |
| `daktiloYazilari` | `string[]` | — | pano | Header'daki daktilo (typewriter) efektinde sırayla yazılan ifadeler. |
| `okulWebSiteUrl` | `string` | admin | PHP | Okulun `*.meb.k12.tr` veya `*.meb.gov.tr` adresi (**Madde 3.1**). Admin panelindeki kontrollü yenileme işlemi bu kaynaktan haber çeker; pano PHP'yi çağırmaz. |
| `konum` | `object` | admin | pano | `{ sehir, enlem, boylam }`. Hava durumu koordinatları ve namaz vakti şehri için kullanılır; varsayılan Konya'dır. |
| `ayarlar` | `object` | admin | pano | Pano davranış ayarları → aşağıya bakın. |
| `gizlilik` | `object` | admin | pano | Personel adı görünümü, alan görünürlüğü ve saklama süresi → aşağıya bakın. |
| `duyurular` | `object[]` | admin | pano | Duyuru kartları ve karusel slaytları → aşağıya bakın. |
| `sinavlar` | `object[]` | admin | pano | Sınav ilanları → aşağıya bakın. |
| `kayanYazi` | `string[]` | admin | pano | Alt bar ticker satırları. Her eleman bir kayan cümledir. |
| `mebHaberler` | `object[]` | `fetch-haberler.php` | pano | MEB sitesinden çekilen haberler. Doluysa karuselde **önceliklidir**. |
| `fotograflar` | `string[]` | — | pano | Karusel için düz görsel URL listesi (`mebHaberler` boşsa kullanılır). |

---

## ⚙️ `ayarlar`

| Alan | Tip | Açıklama |
|---|---|---|
| `karuselSuresi` | `number` | Karusel slayt geçiş süresi (**milisaniye**). Varsayılan `5000`. |
| `temaOtomatik` | `boolean` | `true` ise pano saate göre açık/koyu temaya kendi geçer. |

## 🛡️ `gizlilik`

| Alan | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `personelAdiGosterim` | `string` | `"gorev"` | `gorev`, `basHarf`, `gizli` veya yalnızca yerel pano için `tam`. |
| `nobetciGoster` | `boolean` | `true` | Nöbetçi alanını açar/kapatır. |
| `rehberOgretmenGoster` | `boolean` | `false` | Rehber öğretmen bilgisinin açık kopyaya girip girmeyeceği. |
| `dersOgretmeniGoster` | `boolean` | `false` | Aktif ders ve tamamlama alanında öğretmen gösterimi. |
| `saklamaSuresiGun` | `number` | `365` | Özel personel verisinin son gözden geçirmeden sonra tutulacağı azami gün. |

---

## 📢 `duyurular[]`

| Alan | Tip | Açıklama |
|---|---|---|
| `baslik` | `string` | Kart başlığı. |
| `icerik` | `string` | Duyuru metni. Panoda **escape edilir**, satır sonları `<br>`'a çevrilir. |
| `tarih` | `string` | `GG.AA.YYYY` biçiminde. Panoda bu alana göre **yeniden eskiye** sıralanır. |
| `gorsel` | `string` | Opsiyonel görsel yolu. Boş bırakılabilir. |
| `renk` | `string` | Tema rengi: `primary` \| `info` \| `warning` \| `danger`. |

---

## 📝 `sinavlar[]`

| Alan | Tip | Açıklama |
|---|---|---|
| `ders` | `string` | Ders adı. Panoda başlık `"<ders> Sınavı"` olur. |
| `siniflar` | `string` | Virgülle ayrılmış sınıf listesi (ör. `"9A, 9B, 10A"`). |
| `tarih` | `string` | `GG.AA.YYYY`. |
| `saat` | `string` | `SS:DD`. |

---

## 👨‍🏫 Özel Yönetim Alanları

Bu bölümdeki tam personel kayıtları yalnızca `seyir_admin_data` ve açık uyarıyla
indirilen `*.private.json` yedeğinde bulunabilir. Açık `data.json` dosyasına tam adla
yazılmazlar.

| Alan | Tip | Açıklama |
|---|---|---|
| `tumOgretmenler` | `string[]` | Öğretmen havuzu. Sürükle-bırak nöbet ekranının kaynağıdır. |
| `ogretmenBranslar` | `string[]` | **`"Ad Soyad : Branş"`** biçiminde düz metin kayıtları. |
| `bransListesi` | `string[]` | Seçilebilir branş adları (admin'de yönetilir). |
| `sinifListesi` | `string[]` | Sınıf adları (ör. `"9-A"`). |
| `sinifRehberlik` | `object` | `{ "<sınıf>": "<rehber öğretmen adı>" }`. |

---

## 🛡️ Nöbet Alanları

| Alan | Tip | Açıklama |
|---|---|---|
| `nobetciGunluk` | `object` | `{ "<gün>": ["Ad Soyad (Nöbet Yeri)", …] }`. Gün adları Türkçe (`"Pazartesi"` …). |
| `nobetciOgretmenler` | `string[]` | **Eski (legacy)** tek günlük liste. Yeni kayıtlarda `nobetciGunluk` kullanılır. |

Nöbet yeri parantez içinde yazılır. `(Diğer)`, `(İzinli)` ve `(Ders Tamamlama)`
etiketli kayıtlar **panoda gösterilmez**.

---

## 📅 Ders Programı Alanları

| Alan | Tip | Açıklama |
|---|---|---|
| `dersProgramiOrtaokul` | `object[]` | Ortaokul ders saatleri: `{ ders: "1. Ders", saat: "09:00 - 09:40" }`. |
| `dersProgramiLise` | `object[]` | Lise ders saatleri, aynı yapıda. |
| `dersProgrami` | `object[]` \| `object` | **Eski (legacy)** saat listesi. Dizi ise `dersProgramiOrtaokul`'a taşınır; varsayılan şablonda boş nesne (`{}`) olur. |
| `dersProgramiDetay` | `object` | Asıl haftalık program: `{ "<sınıf>": { "<gün>": { "<saatIndex>": { ders, type } } } }`. |
| `sinifDersleri` | `object` | `{ "<sınıf>": ["<ders adı>", …] }` — sınıfa atanmış dersler. |
| `sinifDersOgretmen` | `object` | `{ "<sınıf>": { "<ders>": "<öğretmen>" } }` — ders/öğretmen eşleşmesi. |
| `dersHavuzuOrtaokul` | `string[]` | Ortaokul ders adı havuzu (sürükle-bırak kaynağı). |
| `dersHavuzuLise` | `string[]` | Lise ders adı havuzu. |

---

## 🔄 `tamamlamaAtamalari`

Nöbetçi öğretmenin, izinli bir öğretmenin dersine atanmasını tutar.

```
{ "<gün>": [ { nobetci, izinli, sinif, dersAdi, saat, timestamp } ] }
```

| Alan | Tip | Açıklama |
|---|---|---|
| `nobetci` | `string` | Dersi tamamlayacak nöbetçi öğretmen. |
| `izinli` | `string` | Yerine geçilen (izinli) öğretmen. |
| `sinif` | `string` | Dersin yapılacağı sınıf. |
| `dersAdi` | `string` | Ders adı. |
| `saat` | `number` | **0 tabanlı** ders saati indeksi (`0` → 1. Ders). |
| `timestamp` | `number` | Atama anının epoch değeri. |

---

## 🧮 Yalnızca Çalışma Anında Üretilenler

Bu alanlar `data.json`'a **yazılmaz**; pano tarafından bellekte üretilir:

| Alan | Kaynak |
|---|---|
| `aktifDersler` | `dersProgramiDetay` + o anki saatten hesaplanır. |
| `diniIcerik` | `data/dini_icerik.json` dosyasından yüklenir. |

---

## 🗂️ İlgili Diğer Veri Dosyaları

| Dosya | İçerik |
|---|---|
| `data/dini_icerik.json` | `{ ayetler: [{ar, t, s}], hadisler: [{t, s}], dualar: [{t, s}] }` — `ar` Arapça metin, `t` Türkçe meal, `s` kaynak. Arapça yalnızca **Vaktin Ayeti** kartında gösterilir (AGENTS.md Kural 3.1). |
| `data/meb_haberler.json` | `fetch-haberler.php` çıktısı: `{ durum, guncelleme, kaynak, haberler[], istatistik }`. `istatistik.ayristirici`, kullanılan tema katmanını (`tema4-haberbant`, `tema5-pgwSlider`, `genel-meb-slider`) bildirir. |
| `data/meb_images/` | Haber görsellerinin MIME doğrulamalı yerel önbelleği. Yerel yazma başarısızsa JSON'da doğrulanmış uzak MEB görsel URL'si tutulur. |
| `data/php_errors.log` | PHP hata kaydı. `data/.htaccess` ile dışarıya kapatılmıştır. |
