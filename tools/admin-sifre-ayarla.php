<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

function gizliOku($istem) {
    fwrite(STDOUT, $istem);
    $sttyVar = stripos(PHP_OS, 'WIN') !== 0 && function_exists('shell_exec');
    if ($sttyVar) shell_exec('stty -echo');
    $deger = trim((string) fgets(STDIN));
    if ($sttyVar) {
        shell_exec('stty echo');
        fwrite(STDOUT, PHP_EOL);
    }
    return $deger;
}

$kullanici = trim((string) readline('Yönetici kullanıcı adı [admin]: '));
if ($kullanici === '') $kullanici = 'admin';
$parola = gizliOku('Güçlü parola (en az 12 karakter): ');
$tekrar = gizliOku('Parolayı tekrar girin: ');

if (strlen($parola) < 12 || !preg_match('/[A-Z]/', $parola) || !preg_match('/[a-z]/', $parola)
    || !preg_match('/\d/', $parola) || !preg_match('/[^A-Za-z0-9]/', $parola)) {
    fwrite(STDERR, "Parola en az 12 karakter; büyük/küçük harf, rakam ve özel karakter içermelidir.\n");
    exit(1);
}
if (!hash_equals($parola, $tekrar)) {
    fwrite(STDERR, "Parolalar eşleşmiyor.\n");
    exit(1);
}

$hedef = dirname(__DIR__) . '/config/admin-auth.php';
$gecici = $hedef . '.tmp';
$icerik = "<?php\n// Otomatik oluşturuldu. Parola değil, yalnızca güvenli hash saklanır.\nreturn array(\n"
    . "    'kullanici' => " . var_export($kullanici, true) . ",\n"
    . "    'parola_hash' => " . var_export(password_hash($parola, PASSWORD_DEFAULT), true) . ",\n"
    . "    'oturum_suresi' => 7200\n);\n";

if (@file_put_contents($gecici, $icerik, LOCK_EX) === false || !@rename($gecici, $hedef)) {
    @unlink($gecici);
    fwrite(STDERR, "config/admin-auth.php yazılamadı. Klasör izinlerini kontrol edin.\n");
    exit(1);
}
@chmod($hedef, 0600);
fwrite(STDOUT, "Yönetici hesabı oluşturuldu: " . $kullanici . "\n");

