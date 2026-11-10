// Cantrix AI Master Console Service Worker (v4)
// Aggressive Cache Invalidation & Instant Cloud Update Engine
const CACHE_NAME = 'cantrix-ai-cache-v4';

self.addEventListener('install', (event) => {
  // Skip waiting immediately to force active installation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Cantrix AI] Purging old cache storage:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Claim control over all open PWA windows and desktop standalone clients
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls are dynamic and never cached
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests (HTML document root): ALWAYS NETWORK-FIRST with cache-busting headers
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone).catch(() => {}));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/index.html')))
    );
    return;
  }

  // Static assets: Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// Force update handler
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.type === 'FORCE_REFRESH')) {
    self.skipWaiting();
  }
});
