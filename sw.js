self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Stale-while-revalidate for HTML - best of both worlds
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Always try to fetch fresh version
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update cache with fresh version
            caches.open('dynamic-cache').then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(() => { /* Ignore fetch errors */ });

        // Return cached version immediately if available, otherwise wait for network
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Network-first for JSON, images, MP3, SVG, etc.
  if (
    url.endsWith('.json') || 
   // url.endsWith('.png') || 
   // url.endsWith('.mp3') ||
    url.endsWith('.ico')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first ONLY for super-static files (if you have any)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Update service worker immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});