/* Seyir: sürümlü uygulama kabuğu; kapsamı ve boyutu sınırlı çalışma önbelleği. */
// GENERATED-PRECACHE-START
const RELEASE = "09585544904ff100";
const PRECACHE_ASSETS = [
    "./",
    "./index.html",
    "./admin.html",
    "./manifest.json",
    "./img/seyir-icon.svg",
    "./img/seyir-icon-192.png",
    "./img/seyir-icon-512.png",
    "./css/fonts/UthmanicHafs.otf",
    "./webfonts/fa-solid-900.woff2",
    "./data/data.json",
    "./data/dini_icerik.json",
    "./data/meb_haberler.json",
    "./css/fontawesome.min.css?v=20260930_ded1c367",
    "./css/seyir.css?v=20261004_09b1c70a",
    "./js/sehir-koordinat.js?v=20260930_5f6f637b",
    "./js/data-policy.js?v=20261004_a0d8f0b1",
    "./js/audio-store.js?v=20261004_2a96b2ca",
    "./js/seyir.js?v=20261004_ccc7111d",
    "./css/admin.css?v=20260930_618c0129",
    "./js/vendor/xlsx.full.min.js?v=20260930_6b3130af",
    "./js/backup.js?v=20261004_de700fb2",
    "./js/backup-handle-store.js?v=20261004_91354023",
    "./js/local-auth.js?v=20261004_aa39bc11",
    "./js/admin.js?v=20261004_b2d47558"
];
// GENERATED-PRECACHE-END
const PREFIX = 'seyir-' + encodeURIComponent(new URL(self.registration.scope).pathname) + '-';
const CACHE_NAME = PREFIX + 'shell-' + RELEASE;
const RUNTIME_NAME = PREFIX + 'runtime-v2';
const ASSETS = new Set(PRECACHE_ASSETS.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
    // Tek bir zorunlu varlık bile eksikse eski çalışan sürüm korunur.
    event.waitUntil(caches.open(CACHE_NAME)
        .then(cache => cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { cache: 'reload' }))))
        .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        for (const name of await caches.keys()) {
            if (name.startsWith(PREFIX) && name !== CACHE_NAME && name !== RUNTIME_NAME) await caches.delete(name);
            if (name === 'seyir-pano-offline-v1.0') await caches.delete(name);
        }
        try {
            const runtime = await caches.open(RUNTIME_NAME);
            await runtime.delete(new URL('data/data.json', self.registration.scope).href);
        } catch (_) {}
        await self.clients.claim();
    })());
});
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
const unavailable = () => new Response('İçerik çevrimdışı kullanılamıyor.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
async function network(request) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try { return await fetch(new Request(request, { signal: controller.signal })); }
    finally { clearTimeout(timeout); }
}
let cacheQueue = Promise.resolve();
function remember(key, response) {
    cacheQueue = cacheQueue.catch(() => {}).then(async () => {
        const cache = await caches.open(RUNTIME_NAME);
        await cache.delete(key);
        await cache.put(key, response);
        const keys = await cache.keys();
        for (const old of keys.slice(0, Math.max(0, keys.length - 64))) await cache.delete(old);
    });
    return cacheQueue;
}
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);
    const scope = new URL(self.registration.scope);
    if (req.method !== 'GET' || req.headers.has('range') || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
    // API yanıtlarını burada güncelmiş gibi sunma; tarih/konum kontrolü istemcide yapılır.
    const relative = url.pathname.slice(scope.pathname.length);
    const isData = ['data/data.json', 'data/dini_icerik.json', 'data/meb_haberler.json'].includes(relative);
    const key = isData ? new URL(relative, scope).href : req.url;
    if (isData) {
        event.respondWith((async () => {
            try {
                const res = await network(req);
                if (res.ok) { await remember(key, res.clone()).catch(() => {}); return res; }
            } catch (_) { /* Aynı veri dosyasının son sağlam kopyasına dön. */ }
            return await (await caches.open(RUNTIME_NAME)).match(key) || await (await caches.open(CACHE_NAME)).match(key) || unavailable();
        })());
        return;
    }
    if (ASSETS.has(req.url)) {
        event.respondWith((async () => await (await caches.open(CACHE_NAME)).match(req) || await network(req).catch(unavailable))());
        return;
    }
    if (req.destination === 'image') {
        event.respondWith((async () => {
            const cache = await caches.open(RUNTIME_NAME);
            const hit = await cache.match(key);
            if (hit) return hit;
            try {
                const res = await network(req);
                if (res.ok && /^image\//.test(res.headers.get('Content-Type') || '')) await remember(key, res.clone()).catch(() => {});
                return res;
            } catch (_) { return unavailable(); }
        })());
    }
});
