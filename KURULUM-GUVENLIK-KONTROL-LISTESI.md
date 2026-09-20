# Seyir Kurulum ve Güvenlik Kontrol Listesi

Seyir tek bir merkezî adresten (`https://seyir.komutrotasi.com`) sunulur. Veritabanı
kullanmaz. Her okulun parolası, adı, logosu, programları ve haberleri yalnızca sistemi
açtığı bilgisayarın ilgili tarayıcı profilinde saklanır.

## 1. Sunucu gereksinimleri

- HTTPS zorunludur. Yerel parola özeti Web Crypto ile yalnızca güvenli bağlantıda çalışır.
- `index.html` ve `admin.html` normal statik dosya olarak sunulmalıdır.
- PHP 7.2+ yalnızca `fetch-haberler.php` ve `fetch-gorsel.php` haber aracıları için gereklidir.
- PHP sunucusunun dış HTTPS bağlantısı için cURL veya `allow_url_fopen` desteği gerekir.
- Haber servisi yalnızca resmî `meb.k12.tr` ve `meb.gov.tr` adreslerini kabul eder.
- `config/nginx-seyir.conf.example` veya kökteki `.htaccess` kuralları uygulanmalıdır.

## 2. Okulun ilk kullanımı

1. Okul bilgisayarında `https://seyir.komutrotasi.com` açılır.
2. Sağ alttaki “Designed & Developed by” imza kartına tıklanır.
3. İlk kullanım ekranında bu bilgisayara özel yönetici parolası iki kez yazılır.
4. İlk açılışta Mahmud Celaleddin Ökten AİHL adı, logosu ve örnek başlangıç haberleri
   görünür; okul bunları panelden kendi adı, logosu ve MEB sitesiyle değiştirir.
5. Sonraki kullanımlarda aynı kart doğrudan parola giriş ekranını açar.

Parola açık metin olarak kaydedilmez. Rastgele salt ve 210.000 turlu PBKDF2-SHA256
özeti yerel tarayıcı alanında tutulur. Parola “Genel Ayarlar → Sistem ve Veri Yönetimi”
bölümünden değiştirilebilir.

## 3. Cihaz ve tarayıcı sınırı

- Veriler alan adına değil, alan adını açan tarayıcı profiline özgüdür.
- Başka bilgisayar veya başka tarayıcı aynı okul verilerini otomatik göremez.
- Gizli/özel pencere kullanılmamalıdır; pencere kapanınca veriler kaybolabilir.
- Tarayıcı verileri temizlenirse okul yapılandırması ve parola da silinir.
- Bilgisayar değişmeden önce “Özel Yönetim Yedeği” indirilmelidir.
- Aynı bilgisayarda farklı okullar kullanılacaksa ayrı işletim sistemi/tarayıcı profilleri
  oluşturulmalıdır.

Yerel parola ekranı yanlışlıkla yapılan değişikliklere karşı cihaz kilididir. Bilgisayara
ve tarayıcı geliştirici araçlarına tam erişimi olan teknik bir kişiye karşı sunucu taraflı
hesap güvenliği sağlamaz. Bu model, verinin bilinçli olarak yalnızca okul bilgisayarında
tutulması tercihine dayanır.

## 4. Haberlerin ayrılması

`fetch-haberler.php` seçilen MEB sitesini anlık olarak okur ve sonucu tarayıcıya döndürür.
`fetch-gorsel.php` yalnızca doğrulanmış resmî MEB görsellerini aynı alan adı üzerinden
tarayıcıya iletir. Okul URL'si, haber listesi veya haber görselleri sunucudaki ortak bir
JSON/cache dosyasına yazılmaz. Sonuç `seyir_admin_data` ve gizlilik uygulanmış
`seyir_public_data` içinde yalnızca ilgili bilgisayarda saklanır.

## 5. KVKK ve veri yönetimi

- `seyir_admin_data`: yalnızca yönetim panelinin kullandığı özel yerel veri.
- `seyir_public_data`: panonun okuduğu, görünürlük kuralları uygulanmış yerel kopya.
- Varsayılan personel görünümü görev adıdır; rehber ve ders öğretmeni kapalıdır.
- “Bu Cihazdaki Tüm Yerel Veriyi Sil” okul verileriyle birlikte parolayı da siler.
- Özel yönetim yedeği kişisel veri içerebilir; web sunucusuna yüklenmemelidir.

Okul; aydınlatma metni, hukuki sebep, yetkiler ve saklama süresini ayrıca belirlemelidir.
Teknik seçenekler tek başına hukuki uyum garantisi değildir.

## 6. Yayın öncesi kontroller

```bash
node tools/encoding-kontrol.js
node tools/guvenlik-kontrol.js
node tools/surum-guncelle.js --kontrol
node --check js/local-auth.js
node --check js/seyir.js
node --check js/admin.js
node tests/local-auth-test.js
php -l admin.php
php -l fetch-haberler.php
php -l fetch-gorsel.php
php -l lib/meb-parser.php
php tests/meb-parser-test.php
```

Kullanıcı tarafından ayrıca ilk parola oluşturma, giriş/çıkış, parola değiştirme, yedek
alma, veri silme ve farklı MEB temalarından haber çekme işlemleri gerçek tarayıcıda manuel
olarak denenmelidir.
