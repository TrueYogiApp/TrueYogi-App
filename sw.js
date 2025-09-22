self.addEventListener('fetch', event => {
  // Always fetch HTML from network first (for updates)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Optionally update cached HTML here if you want offline
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For assets, use cache first, then network if missing
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// Optional: update service worker immediately on new deployment
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  clients.claim();
});