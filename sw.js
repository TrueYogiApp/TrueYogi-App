self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always network-first for HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for JSON, images, MP3, SVG, etc.
  if (
    url.endsWith('.json') || 
    url.endsWith('.png') || 
    url.endsWith('.mp3') ||
    url.endsWith('.ico')
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first ONLY for super-static files
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => cached);
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
