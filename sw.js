/**
 * Seyir Dijital Okul Panosu — Service Worker (PWA & Çevrimdışı Çalışma Motoru)
 * Sürüm: 2026.09.24-v1
 *
 * İnternet bağlantısı kesildiğinde okul panosunun ders programı, nöbetçiler,
 * duyurular, ezan vakitleri ve temel arayüz varlıklarıyla kesintisiz çalışmasını sağlar.
 */

const CACHE_NAME = 'seyir-pano-offline-v1.0';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './admin.html',
    './manifest.json',
    './css/seyir.css',
    './css/admin.css',
    './css/fontawesome.min.css',
    './webfonts/fa-solid-900.woff2',
    './js/vendor/qrcode.min.js',
    './js/vendor/xlsx.full.min.js',
    './js/sehir-koordinat.js',
    './js/audio-store.js',
    './js/local-auth.js',
    './js/seyir.js',
    './js/admin.js',
    './img/okul_logo.png',
    './img/favicon.png',
    './data/data.json',
    './data/dini_icerik.json',
    './data/meb_haberler.json'
];

// 1. Kurulum: Kritik kabuk (App Shell) dosyalarını önbelleğe al
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                PRECACHE_ASSETS.map((url) => {
                    return cache.add(url).catch((err) => {
                        console.warn(`[SW] Önbelleğe alınamadı: ${url}`, err);
                    });
                })
            );
        }).then(() => self.skipWaiting())
    );
});

// 2. Etkinleştirme: Eski önbellekleri temizle ve istemcileri hemen denetle
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. İstek Yakalama (Fetch): Ağ öncelikli veya Önbellek öncelikli hibrit strateji
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Yalnızca GET isteklerini ele al
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Chrome uzantıları veya farklı protokollere müdahale etme
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // A) Veri Dosyaları (data.json, dini_icerik.json, meb_haberler.json)
    // Strateji: Ağ Öncelikli (Network-First), Başarısız olursa Önbelleğe dön
    if (url.pathname.includes('/data/') && (url.pathname.endsWith('.json') || url.search.includes('data.json'))) {
        event.respondWith(
            fetch(req)
                .then((networkRes) => {
                    if (networkRes && networkRes.ok) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return networkRes;
                })
                .catch(async () => {
                    const cachedRes = await caches.match(req);
                    if (cachedRes) return cachedRes;
                    // Eğer doğrudan istek eşleşmezse data/data.json dene
                    return caches.match('./data/data.json');
                })
        );
        return;
    }

    // B) Dış API'ler (Open-Meteo hava durumu, Aladhan namaz vakitleri)
    // Strateji: Ağ dene, başarısızsa önbellekteki son yanıtı döndür
    if (url.hostname.includes('api.open-meteo.com') || url.hostname.includes('api.aladhan.com')) {
        event.respondWith(
            fetch(req)
                .then((networkRes) => {
                    if (networkRes && networkRes.ok) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return networkRes;
                })
                .catch(async () => {
                    const cached = await caches.match(req);
                    if (cached) return cached;
                    return new Response(JSON.stringify({ offline: true }), {
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // C) Statik Kabuk Dosyaları (HTML, CSS, JS, Font, Resim)
    // Strateji: Önbellek Öncelikli (Stale-While-Revalidate)
    event.respondWith(
        caches.match(req).then((cachedRes) => {
            const fetchPromise = fetch(req)
                .then((networkRes) => {
                    if (networkRes && networkRes.ok) {
                        const copy = networkRes.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return networkRes;
                })
                .catch(() => cachedRes);

            return cachedRes || fetchPromise;
        })
    );
});
