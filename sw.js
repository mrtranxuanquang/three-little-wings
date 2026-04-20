// Three Little Wings — Service Worker
// Caches shell + assets for offline play

const CACHE_NAME = 'tlw-v2.6-2026-04-20-anim-polish';
const SHELL = [
  './',
  './index.html',
  './game.js',
  './manifest.json',
  './js/config.js',
  './js/assets.js',
  './js/input.js',
  './js/audio.js',
  './js/physics.js',
  './js/character.js',
  './js/dialog.js',
  './js/cutscene.js',
  './js/scenes/loading.js',
  './js/scenes/mainmenu.js',
  './js/scenes/gameplay.js',
  './js/scenes/chapter-end.js',
  './js/scenes/demo-end.js',
  './js/scenes/credits.js',
  './js/chapters/chapter1.js',
  './js/chapters/chapter2.js',
  './js/chapters/chapter3.js',
  './js/chapters/chapter4.js',
  './js/chapters/chapter5.js',
  './js/chapters/chapter6.js',
  './js/chapters/chapter7.js',
  './js/chapters/chapter8.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;
  // Skip cross-origin (Google Fonts etc. — let browser handle)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Cache successful same-origin responses for future
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone).catch(() => {}));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
