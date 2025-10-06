// service-worker.js — Optimized version

const APP_VERSION = '1.3';
const CACHE_NAME = `TrueYogi-App-${APP_VERSION}`;
const PERMANENT_CACHE_NAME = 'TrueYogi-Permanent-v1'; 

// Permanent assets that rarely change 13
const AUDIO_ASSETS = [
  '/assets/aum.mp3',
  '/assets/bell.m4a',
  '/assets/harmony-bell.m4a',
  '/assets/tao-chi-gong.mp3',
  '/assets/tamtam-gong.m4a',
  '/assets/meditation-eternal.m4a',
  '/assets/music7.m4a',
  '/assets/music6.m4a',
  '/assets/music5.m4a',
  '/assets/music4.m4a',
  '/assets/music3.m4a',
  '/assets/music2.m4a',
  '/assets/music1.m4a'
];

const PERMANENT_ASSETS = [
  '/assets/yogi-avatar.gif',
  '/assets/icrown3.png',
  '/assets/lungs.svg',
  '/assets/spaceship.svg',
  '/assets/flowmeditate.svg',
  '/assets/truemeditate.svg'
];

// App files that change more often
const APP_FILES = [
  '/',
  '/index.html',
  '/output.css',
  '/assets/manifest.json',
  '/assets/welcomeMessages.en.json',
  '/assets/welcomeMessages.te.json',
  '/assets/welcomeMessages.fr.json',
  '/locales/en.json',
  '/locales/te.json',
  '/locales/fr.json',      
  '/assets/quotes.en.json',
  '/assets/quotes.te.json',
  '/assets/quotes.fr.json',
  '/assets/wisdom.en.json',
  '/assets/wisdom.te.json',
  '/assets/wisdom.fr.json'
];

// Helper: sequentially cache audio files
async function cacheAudioFiles(cache) {
  for (const file of AUDIO_ASSETS) {
    try {
      await cache.add(file);
      console.log('✅ Audio cached:', file);
    } catch (e) {
      console.warn('❌ Audio cache failed:', file, e);
    }
  }
}

// INSTALL EVENT
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing caches', CACHE_NAME, PERMANENT_CACHE_NAME);

  event.waitUntil(
    Promise.all([
      // Permanent cache: only add missing files (non-audio)
      caches.open(PERMANENT_CACHE_NAME).then(async (permanentCache) => {
        const existingKeys = await permanentCache.keys();
        const existingUrls = new Set(existingKeys.map(req => req.url));

        await Promise.all(
          PERMANENT_ASSETS.map(async (file) => {
            const fullUrl = new URL(file, self.location.origin).href;
            if (!existingUrls.has(fullUrl)) {
              try {
                await permanentCache.add(file);
                console.log('✅ Permanent cached:', file);
              } catch (e) {
                console.warn('❌ Permanent cache failed:', file, e);
              }
            } else {
              console.log('🔵 Already in permanent cache:', file);
            }
          })
        );

        // Now cache audio files sequentially
        await cacheAudioFiles(permanentCache);
      }),

      // App cache: always update
      caches.open(CACHE_NAME).then(async (appCache) => {
        await Promise.all(
          APP_FILES.map(async (file) => {
            try {
              await appCache.add(file);
              console.log('✅ App cached:', file);
            } catch (e) {
              console.warn('❌ App cache failed:', file, e);
            }
          })
        );
      })
    ])
    .then(() => {
      console.log('Service Worker: All caches installed');
      return self.skipWaiting();
    })
    .catch((error) => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// ACTIVATE EVENT
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, PERMANENT_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('🧹 Deleting unused cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => {
      console.log('✅ Service Worker: Only whitelisted caches remain.');
      return self.clients.claim();
    })
  );
});


// FETCH EVENT
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Only cache successful non-HTML requests
        if (networkResponse.status === 200 && event.request.destination !== 'document') {
          const responseToCache = networkResponse.clone();
          const url = new URL(event.request.url);
          const cacheName = isPermanentAsset(url.pathname)
            ? PERMANENT_CACHE_NAME
            : CACHE_NAME;

          caches.open(cacheName).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        console.log('🌐 Network failed, using cache for:', event.request.url);
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;

          // Offline fallback logic
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          } else if (event.request.destination === 'image') {
            return caches.match('/assets/spaceship.svg');
          }
        });
      })
  );
});

// HELPER — Safe permanent asset check
function isPermanentAsset(pathname) {
  pathname = pathname.replace(/\?.*$/, ''); // Strip query params (e.g., ?v=123)
  return PERMANENT_ASSETS.concat(AUDIO_ASSETS).some(asset => pathname.endsWith(asset));
}

// MESSAGE EVENTS
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'UPDATE_PERMANENT_ASSETS') {
    event.waitUntil(
      caches.open(PERMANENT_CACHE_NAME).then(cache => {
        const newAssets = event.data.assets || [];
        return Promise.all(
          newAssets.map(asset => cache.add(asset).catch(() => {}))
        );
      })
    );
  }

  if (event.data.type === 'CLEAR_APP_CACHE') {
    event.waitUntil(caches.delete(CACHE_NAME));
  }
});

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    // future: upload meditation progress, sync user state, etc.
  }
});

// PUSH NOTIFICATIONS
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

// NOTIFICATION CLICK HANDLER
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
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