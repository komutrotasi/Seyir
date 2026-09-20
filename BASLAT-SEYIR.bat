@echo off
chcp 65001 >nul
cd /d "%~dp0"

where php >nul 2>nul
if errorlevel 1 (
    echo PHP bulunamadı.
    echo PHP 7.2 veya üzerini kurun ya da projeyi PHP destekli sunucuya yükleyin.
    echo VS Code Live Server, PHP dosyalarını çalıştırmaz.
    pause
    exit /b 1
)

echo Seyir PHP sunucusu başlatılıyor: http://127.0.0.1:8000
start "" "http://127.0.0.1:8000/"
php -S 127.0.0.1:8000

