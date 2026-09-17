<?php
/**
 * Eski bağlantılar için uyumluluk geçidi.
 * Yönetici parolası ve okul verileri sunucuda değil, okul bilgisayarının
 * tarayıcısında tutulur. Asıl giriş ekranı statik admin.html sayfasıdır.
 */
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');
header('Location: admin.html', true, 302);
exit;
