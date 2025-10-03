// service-worker.js

const CACHE_NAME = `TryeYogi-App-${Date.now()}`;

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing with cache', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Caching files');

        // List of files
        const regularFiles = [
          '/',
          '/index.html',
          '/output.css',
		  '/assets/manifest.json',
          '/assets/yogi-avatar.gif',
          '/assets/icrown3.png',
          '/assets/flowmeditate.svg',
		  '/assets/truemeditate.svg',
          '/assets/quotes.en.json',
          '/assets/welcomeMessages.en.json',
          '/locales/en.json',
          '/locales/te.json',
          '/locales/fr.json',
          '/assets/lungs.svg',
          '/assets/privacy.html',  
          '/assets/terms.html',
          '/assets/whitepaper.html',		  
          '/assets/spaceship.svg',         
          '/assets/quotes.en.json'
        ];

        const audioFiles = [
          '/assets/aum.mp3',
          '/assets/bell.wav',
          '/assets/harmony-bell.wav',
          '/assets/tao-chi-gong.mp3',
          '/assets/tamtam_gong.wav',
          '/assets/music4.mp3',
          '/assets/meditation-eternal.wav'
        ];

        // Cache regular files one by one (skip failures)
        for (const file of regularFiles) {
          try {
            await cache.add(file);
            console.log('✅ Cached:', file);
          } catch (e) {
            console.warn('❌ Failed to cache:', file, e);
          }
        }

        // Cache audio files one by one (skip failures)
        for (const audioFile of audioFiles) {
          try {
            await cache.add(audioFile);
            console.log('✅ Audio cached:', audioFile);
          } catch (e) {
            console.warn('❌ Audio cache failed:', audioFile, e);
          }
        }
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Now ready to handle fetches');
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Fetch event - NETWORK FIRST strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
    
  event.respondWith(
    // ALWAYS try network first
    fetch(event.request)
      .then(networkResponse => {
        // If we get a good response, cache it
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      })
      .catch(error => {
        // Network failed - try cache
        console.log('🌐 Network failed, trying cache:', event.request.url);
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If nothing in cache, return offline page for HTML requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Background sync example (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // Handle background sync tasks here
  }
});

// Push notification example (optional)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'App Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});