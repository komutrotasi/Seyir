<?php
// Yalnızca PHP geliştirme sunucusu: kaynak ve özel yedekler için izin listesi.
$root = realpath(__DIR__ . '/..');
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
if ($path === '/') $path = '/index.html';
$allowed = preg_match('~^/(?:index\.html|admin\.html|admin\.php|fetch-haberler\.php|fetch-gorsel\.php|sw\.js|manifest\.json|(?:css|js|img|webfonts)/[A-Za-z0-9_./-]+|data/(?:data|dini_icerik|meb_haberler)\.json)$~D', $path);
$file = realpath($root . $path);
if (!$allowed || strpos($path, '/.') !== false || strpos($path, '..') !== false || !$file || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file) || preg_match('/\.private\.json$/i', $file)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Bulunamadı';
    return true;
}
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
return false;
