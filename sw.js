// service-worker.js — Optimized version

const APP_VERSION = '1.3.1';
const CACHE_NAME = `TrueYogi-App-${APP_VERSION}`;
const PERMANENT_CACHE_NAME = 'TrueYogi-Permanent-v2.2; 

// Permanent assets that rarely change 13
const AUDIO_ASSETS = [
  '/assets/aum.mp3',
  '/assets/bell.m4a',
  '/assets/harmony-bell.m4a',
  '/assets/tao-chi-gong.m4a',
  '/assets/tamtam-gong.m4a',
  '/assets/meditation-eternal.m4a',
  '/assets/meditation-end.mp3', 
  '/assets/music7.m4a',
  '/assets/music6.m4a',
  '/assets/music5.m4a',
  '/assets/music4.m4a',
  '/assets/music3.m4a',
  '/assets/music2.m4a',
  '/assets/music1.m4a',
  '/assets/crown_aum_963hz.mp3',
  '/assets/thirdeye_om_852hz.mp3',
  '/assets/throat_ham_741hz.mp3',
  '/assets/heart_yam_639hz.mp3',
  '/assets/solar_ram_528hz.mp3',
  '/assets/sacral_vam_417hz.mp3',
  '/assets/root_lam_396hz.mp3'
];

const PERMANENT_ASSETS = [
  '/assets/yogi-avatar.gif',
  '/assets/icrown3.png',
  '/assets/lungs.svg',
  '/assets/spaceship.svg',
  '/assets/flowmeditate.svg',
  '/assets/truemeditate.svg',
  '/assets/groupmeditate.svg'
];

// App files that change more often
const APP_FILES = [
  '/',
  '/index.html',
  '/output.css',
  '/manifest.json',
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
  const existingKeys = await cache.keys();
  const existingUrls = new Set(existingKeys.map(req => req.url));

  for (const file of AUDIO_ASSETS) {
    const fullUrl = new URL(file, self.location.origin).href;
    if (!existingUrls.has(fullUrl)) {
      try {
        await cache.add(file);
        console.log('✅ Audio cached:', file);
      } catch (e) {
        console.warn('❌ Audio cache failed:', file, e);
      }
    } else {
      console.log('🔵 Already in permanent cache:', file);
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
  const expectedCaches = [CACHE_NAME, PERMANENT_CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Log all cache names for debugging
      console.log('All cache names on activate:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that matches our app's naming pattern but is not current
          if (
            (
              cacheName.startsWith('TrueYogi-App-') && cacheName !== CACHE_NAME
            ) ||
            (
              cacheName.startsWith('TrueYogi-Permanent') && cacheName !== PERMANENT_CACHE_NAME
            )
          ) {
            console.log('🧹 Aggressively deleting old or duplicate cache:', cacheName);
            return caches.delete(cacheName);
          }
          // Also delete anything not in the expected list (paranoia)
          if (!expectedCaches.includes(cacheName)) {
            console.log('🧹 Deleting non-whitelisted cache:', cacheName);
            return caches.delete(cacheName);
          }
          // Otherwise, keep it
          return Promise.resolve();
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Only current caches remain.');
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
        // Cache successful non-document requests (e.g., assets, audio, etc.)
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
        const url = new URL(event.request.url);

        // Try matching different forms (Request, full URL, pathname)
        return caches.match(event.request)
          .then(response => response || caches.match(event.request.url))
          .then(response => response || caches.match(url.pathname))
          .then(response => {
            if (response) return response;

            // Navigation fallback (for PWA/standalone, deep links, etc)
            if (
              event.request.mode === 'navigate' ||
              event.request.destination === 'document'
            ) {
              // Always serve index.html for navigation requests
              return caches.match('/index.html');
            }

            // Image fallback
            if (event.request.destination === 'image') {
              return caches.match('/assets/spaceship.svg');
            }

            // Audio/video fallback (optional)
            if (['audio', 'video'].includes(event.request.destination)) {
              // You can provide a silent fallback or a default audio/video
              return new Response('', { status: 404, statusText: 'Audio/Video not cached' });
            }

            // Ultimate fallback
            return new Response('', { status: 408, statusText: 'Offline' });
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
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== PERMANENT_CACHE_NAME) {
            // Delete any cache that isn't the current app or permanent cache
            return caches.delete(cacheName);
          }
        }).concat(caches.delete(CACHE_NAME)) // Also delete the app cache itself
      );
    })
  );
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
