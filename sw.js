self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Cache-first for EVERYTHING
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        // Always return cached version if available
        if (cached) {
          return cached;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Optionally cache the new response for future
            return response;
          })
          .catch(error => {
            // If both cache and network fail, you could return a fallback
            throw error;
          });
      })
  );
});

// Cache important files during install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('app-cache-v1')
      .then(cache => {
        return cache.addAll([
          '/', // Your main HTML
          '/index.html',
          // Add other critical files like CSS, JS, manifest here
        ]);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});