self.addEventListener('fetch', event => {
  // For HTML pages - try cache first, then network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Return cached page if available
        if (cached) return cached;
        // Otherwise fetch from network
        return fetch(event.request);
      })
    );
    return;
  }

  // For everything else - try cache first, then network
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});

// Pre-cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-assets').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/output.css',
        '/assets/icrown3.png', 
        '/assets/yogi-avatar.gif',
        // Add paths to your CSS and JS files here
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});