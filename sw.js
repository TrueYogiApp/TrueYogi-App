self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always network-first for HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          return await fetch(event.request);
        } catch (error) {
          // If network fails, try cache
          const cached = await caches.match(event.request);
          if (cached) return cached;
          
          // If no cached version, return a simple offline page
          // This prevents the Safari error but keeps the app usable
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head><title>True Yogi</title></head>
              <body>
                <div style="padding: 20px; text-align: center;">
                  <h2>You're offline</h2>
                  <p>Please check your connection and try again.</p>
                  <button onclick="location.reload()">Retry</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
    return;
  }

  // Rest of your existing code remains the same...
  if (url.endsWith('.json') || url.endsWith('.ico')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  clients.claim();
});