const CACHE_NAME = 'boni-saude-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://placehold.co/192x192/8B5CF6/FFFFFF.png?text=B',
  'https://placehold.co/512x512/8B5CF6/FFFFFF.png?text=B'
];

// Install event: opens a cache and adds the core files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves requests from cache if available, otherwise fetches from the network.
self.addEventListener('fetch', event => {
  // For navigation requests, use a network-first strategy, falling back to the cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.match('index.html');
        });
      })
    );
    return;
  }

  // For all other requests, use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
