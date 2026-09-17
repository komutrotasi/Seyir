# Seyir Kurulum ve Güvenlik Kontrol Listesi

Bu belge her okul kurulumu için uygulanmalıdır. Seyir veritabanı kullanmaz; yönetim
verisi tarayıcıda, açık pano verisi `data/data.json` dosyasında ve haber önbelleği
`data/meb_haberler.json` dosyasında tutulur.

## 1. Sunucu gereksinimleri

- PHP 7.2 veya üzeri.
- HTTPS sertifikası ve HTTP → HTTPS yönlendirmesi.
- Dış HTTPS bağlantısı; cURL veya `allow_url_fopen` seçeneklerinden en az biri.
- `data/` ve `data/meb_images/` için PHP kullanıcısına yazma izni. Gereksiz `777`
  izni verilmemelidir.
- Apache kullanılıyorsa `mod_rewrite`, `mod_authz_core` ve `.htaccess` desteği.
- Nginx kullanılıyorsa `config/nginx-seyir.conf.example` kuralları sunucu bloğuna
  uyarlanmalıdır; `.htaccess` Nginx tarafından okunmaz.

## 2. Yönetici hesabı

Kurulumdan sonra pano ekranındaki “Designed & Developed by” imza kartına tıklanır.
Henüz hesap yoksa `admin.php` ilk açılış sihirbazını gösterir; kullanıcı adı ve güçlü
parola tarayıcıdan belirlenir. Hesap bir kez oluşturulduktan sonra bu ekran kapanır ve
aynı kart normal giriş ekranını açar. Parola, yönetim panelindeki “Sistem ve Veri
Yönetimi” bölümünden değiştirilebilir.

Web tabanlı ilk kurulum için PHP kullanıcısının `config/` klasörüne yazabilmesi gerekir.
Sorun giderme veya sunucu yöneticisi tarafından parola sıfırlama amacıyla şu komut da
kullanılabilir:

```bash
php tools/admin-sifre-ayarla.php
```

Her okul farklı, en az 12 karakterlik; büyük/küçük harf, rakam ve özel karakter içeren
güçlü parola kullanmalıdır. Web sihirbazı ve komut satırı aracı açık parolayı kaydetmez;
`config/admin-auth.php` içine yalnızca `password_hash()` çıktısı yazar. Bu dosya kaynak
kontrolüne eklenmez ve web erişimine kapatılır.

Alternatif olarak sunucu ortamında `SEYIR_ADMIN_USER` ve
`SEYIR_ADMIN_PASSWORD_HASH` değişkenleri tanımlanabilir. Eski `admin.html` adresi
Apache'de `admin.php` adresine yönlendirilir. İlk kurulum ekranı internete açık bir
sunucuda bekletilmemeli; kurulum tamamlanır tamamlanmaz okul hesabı oluşturulmalıdır.

> Pano dosyası doğrudan veya yalnızca statik dosya sunan Live Server ile açılırsa PHP
> çalışmaz. İmza kartı bu durumda `admin.php` dosyasının indirilmesini engeller ve
> kurulum sorumlusuna PHP desteğinin etkinleştirilmesi gerektiğini bildirir.

## 3. Veri ayrımı

- `seyir_admin_data`: Yetkili cihazdaki özel yönetim verisi; pano bunu okumaz.
- `seyir_public_data`: Gizlilik ayarları uygulanmış yerel pano kopyası.
- `data/data.json`: Sunucuya yüklenebilen açık pano dosyası; tam personel adı
  içermemelidir.
- `*.private.json`: Kişisel veri içerebilen özel yedek; web sunucusuna kesinlikle
  yüklenmemeli, şifreli ve yetkili kurumsal alanda saklanmalıdır.

Admin panelindeki “KVKK Güvenli Pano Görünümü” varsayılan olarak görev adı gösterir;
rehber ve aktif ders öğretmeni alanlarını kapalı tutar. Okul, işleme amacı ve hukuki
dayanağı değerlendirmeden “Tam ad” seçeneğini etkinleştirmemelidir.

## 4. Saklama ve silme

- Varsayılan personel verisi saklama süresi 365 gündür ve okul politikasına göre
  kısaltılabilir.
- Süre dolduğunda personel alanları yönetici girişinde temizlenir; kurumsal içerik
  korunur.
- “Bu Cihazdaki Tüm Yerel Veriyi Sil” işlemi özel/açık Seyir kayıtlarını ve tema
  tercihini kaldırır.
- Eski cihaz devredilmeden önce tarayıcı profili de işletim sistemi düzeyinde
  silinmelidir.

## 5. KVKK ve dış servisler

Okul; veri sorumlusu kimliği, amaç, hukuki sebep, aktarım, saklama süresi ve ilgili
kişi haklarını içeren kendi aydınlatma metnini yayımlamalıdır. Başlangıç taslağı
`KVKK-AYDINLATMA-SABLONU.md` dosyasındadır. Bu teknik seçenekler tek başına hukuki
uyum garantisi değildir.

Font Awesome, Arapça font ve Excel kütüphanesi sürümü sabitlenmiş yerel dosyalardan
sunulur. Pano yalnızca hava durumu için Open-Meteo ve namaz vakitleri için Aladhan
servislerine ağ isteği gönderir. Kurumun ağ/veri aktarım politikası bu servisleri ayrıca
değerlendirmelidir; gerekirse ilgili kartlar kurum içi veri kaynağına uyarlanmalıdır.

## 6. Yayın öncesi kontroller

```bash
node tools/encoding-kontrol.js
node tools/guvenlik-kontrol.js
node tools/surum-guncelle.js --kontrol
node --check js/seyir.js
node --check js/admin.js
php -l admin.php
php -l fetch-haberler.php
php -l lib/admin-auth.php
php -l lib/meb-parser.php
php tests/meb-parser-test.php
```

Kullanıcı tarafından ayrıca masaüstü, mobil, akıllı tahta ve TV ölçekleme testleri;
giriş/çıkış, açık veri aktarımı, özel yedek uyarısı ve üç gerçek MEB tema testi
tarayıcıda manuel olarak yapılmalıdır.
