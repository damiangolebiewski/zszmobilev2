// Service worker — gra działa offline po pierwszym otwarciu.
// Po każdej aktualizacji gry zmień CACHE (np. v2 → v3), aby telefony pobrały nowe pliki.
const CACHE = 'ruszkowski-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './assets/damian.png', './assets/uczen.png', './assets/logo.png', './assets/bg.png', './assets/pan-d.png', './assets/uczennica.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache first, w tle odświeżenie z sieci (stale-while-revalidate).
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin)
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
