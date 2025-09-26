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

  // Cache-first ONLY for super-static files (if you have any)
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Update service worker immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-v1').then(cache => {
      return cache.addAll([
        '/assets/icrown3.png', // Precache your logo
        // add other must-have assets here
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});
