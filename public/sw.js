const CACHE_NAME = 'lifegraph-finops-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
          return Promise.resolve();
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Never intercept API calls, Firebase endpoints, or dev server middleware
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@fs')
  ) {
    return;
  }

  // Navigation requests: Network first with graceful fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('./index.html');
        return (
          cached ||
          (await caches.match('/index.html')) ||
          new Response('Network error occurred. Please reload.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        );
      })
    );
    return;
  }

  // Static assets: Pass through network; cache only successfully fetched responses safely
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Do not return undefined to respondWith - let the browser handle natural fetch failure
        return new Response('', { status: 408, statusText: 'Request Timeout' });
      })
  );
});
