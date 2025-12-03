const CACHE_NAME = 'vizualni-admin-v1';
const STATIC_CACHE_NAME = 'vizualni-admin-static-v1';
const DYNAMIC_CACHE_NAME = 'vizualni-admin-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/_next/static/css/',
  '/_next/static/js/',
  '/images/',
  '/favicon.ico',
];

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE_NAME);
      console.log('[SW] Caching static assets');
      // Cache pages and critical assets
      await cache.addAll([
        '/',
        '/_next/static/framework.js',
        '/_next/static/chunks/main.js',
        '/_next/static/chunks/pages/_app.js',
        '/_next/static/chunks/pages/_error.js',
      ]);
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[SW] Activating service worker');

      // Clean up old caches
      const cacheNames = await caches.keys();
      const deletions = cacheNames
        .filter(name => name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
        .map(name => caches.delete(name));

      await Promise.all(deletions);

      // Take control of all open pages
      return self.clients.claim();
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external requests
  if (
    request.method !== 'GET' ||
    !url.origin.includes(self.location.origin) ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // Determine cache strategy based on request type
  let strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;

  if (url.pathname.startsWith('/_next/static/')) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (url.pathname.startsWith('/images/')) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  } else if (url.pathname === '/') {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Handle request based on strategy
async function handleRequest(request, strategy) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cache);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cache);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache);

    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);

    case CACHE_STRATEGIES.CACHE_ONLY:
      return cache.match(request);

    default:
      return staleWhileRevalidate(request, cache);
  }
}

// Cache-first strategy
async function cacheFirst(request, cache) {
  const cached = await cache.match(request);
  if (cached) {
    // Update cache in background
    updateCacheInBackground(request, cache);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cache) {
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch((error) => {
    console.error('[SW] Stale-while-revalidate fetch failed:', error);
  });

  // Return cached version immediately if available, else wait for network
  return cached || fetchPromise;
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
  } catch (error) {
    // Ignore background update errors
  }
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('[SW] Performing background sync');
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/icon-192x192.png',
      badge: '/images/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1,
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Cache cleanup - run periodically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    cleanupCache();
  }
});

async function cleanupCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const requests = await cache.keys();
    const now = Date.now();

    // Remove entries older than 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }

    console.log('[SW] Cache cleanup completed');
  } catch (error) {
    console.error('[SW] Cache cleanup failed:', error);
  }
}

// Performance monitoring
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/web-vitals')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          const data = await response.json();

          // Store performance metrics for analysis
          const cache = await caches.open(DYNAMIC_CACHE_NAME);
          const metrics = {
            ...data,
            timestamp: Date.now(),
          };

          await cache.put(
            new Request('/web-vitals-metrics'),
            new Response(JSON.stringify(metrics))
          );

          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })()
    );
  }
});

console.log('[SW] Service worker installed and ready');