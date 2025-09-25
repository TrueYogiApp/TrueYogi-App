self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always network-first for HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
      .then(response => response || caches.match('/'))  // ← ONLY CHANGE
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
