self.addEventListener('fetch', event => {
  // Network-first for EVERYTHING - simple and consistent
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network request succeeds, update cache
        caches.open('app-cache')
          .then(cache => cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then(cached => cached || new Response('Offline content not available'));
      })
  );
});

// Update service worker immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});