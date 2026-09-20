#!/bin/sh
set -eu

cd -- "$(dirname -- "$0")"

if ! command -v php >/dev/null 2>&1; then
    printf '%s\n' 'PHP bulunamadı. PHP 7.2 veya üzerini kurun ya da projeyi PHP destekli sunucuya yükleyin.' >&2
    exit 1
fi

printf '%s\n' 'Seyir PHP sunucusu: http://127.0.0.1:8000'
exec php -S 127.0.0.1:8000

