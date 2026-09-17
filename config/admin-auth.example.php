<?php
// Bu dosyayı doğrudan kullanmayın. admin.php ilk açılış sihirbazı veya
// tools/admin-sifre-ayarla.php güvenli password_hash() çıktısıyla
// config/admin-auth.php dosyasını üretir.
return array(
    'kullanici' => 'admin',
    'parola_hash' => '',
    'oturum_suresi' => 7200
);
