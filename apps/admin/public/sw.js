/* Nexus Admin service worker.
 *
 * Strategy (deliberately conservative: this is an authenticated app):
 *  - Never cache HTML, API calls or anything user specific.
 *  - Precache only the offline fallback page, its static assets and the app icons.
 *  - Navigations: network first; if the network fails, show the cached /offline page.
 *  - Hashed build assets (/_next/static) and icons: cache first.
 * Bump VERSION to invalidate old caches.
 */
const VERSION = 'v3';
const CACHE = `nexus-static-${VERSION}`;
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      // The offline page needs its own CSS/JS to render without a network: cache what it references.
      try {
        const html = await (await fetch(OFFLINE_URL, { cache: 'reload' })).text();
        const assets = [...new Set([...html.matchAll(/\/_next\/static\/[^"'\\\s)]+/g)].map((m) => m[0]))];
        await Promise.all(assets.map((url) => cache.add(url).catch(() => undefined)));
      } catch {
        // Offline during install: the fallback still works for the HTML shell.
      }
    })(),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('nexus-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
