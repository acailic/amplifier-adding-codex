interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.0/8 are considered localhost for IPv4.
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: ServiceWorkerConfig): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL('/sw.js', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

async function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('[SW] Service worker registered successfully');

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the updated precached content has been fetched,
            // but the previous service worker will still serve the older
            // content until all client tabs are closed.
            console.log('[SW] New content is available and will be used when all tabs for this page are closed.');

            // Execute callback
            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }

            // Show notification to user (optional)
            showUpdateNotification(registration);
          } else {
            // At this point, everything has been precached.
            console.log('[SW] Content is cached for offline use.');

            // Execute callback
            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };

    // Handle network status changes
    handleNetworkStatusChanges(config);

  } catch (error) {
    console.error('[SW] Error during service worker registration:', error);
  }
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW] No internet connection found. App is running in offline mode.');
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Show update notification to user
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  if (!document.querySelector('#update-notification')) {
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold">Nova verzija dostupna</h4>
          <p class="text-sm">Osvežite stranicu da dobijete najnovije funkcije.</p>
        </div>
        <div class="flex space-x-2 ml-4">
          <button id="update-later" class="text-sm bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded">
            Kasnije
          </button>
          <button id="update-now" class="text-sm bg-white text-blue-600 hover:bg-gray-100 px-3 py-1 rounded font-semibold">
            Osveži
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Add event listeners
    document.getElementById('update-later')?.addEventListener('click', () => {
      notification.remove();
    });

    document.getElementById('update-now')?.addEventListener('click', () => {
      // Tell the new service worker to skip waiting
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      // Reload the page
      window.location.reload();
    });

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (document.querySelector('#update-notification')) {
        notification.remove();
      }
    }, 30000);
  }
}

// Handle network status changes
function handleNetworkStatusChanges(config?: ServiceWorkerConfig) {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;

    // Update UI or trigger callbacks
    if (isOnline) {
      console.log('[SW] App is online');
      if (config?.onOnline) {
        config.onOnline();
      }
      removeOfflineNotification();
    } else {
      console.log('[SW] App is offline');
      if (config?.onOffline) {
        config.onOffline();
      }
      showOfflineNotification();
    }

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('network-status-changed', {
      detail: { isOnline }
    }));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial status
  updateOnlineStatus();
}

// Show offline notification
function showOfflineNotification() {
  if (!document.querySelector('#offline-notification')) {
    const notification = document.createElement('div');
    notification.id = 'offline-notification';
    notification.className = 'fixed top-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 class="font-semibold">Van mreže</h4>
          <p class="text-sm">Aplikacija radi u režimu van mreže. Neke funkcije mogu biti ograničene.</p>
        </div>
      </div>
    `;

    document.body.appendChild(notification);
  }
}

// Remove offline notification
function removeOfflineNotification() {
  const notification = document.querySelector('#offline-notification');
  if (notification) {
    notification.remove();
  }
}

// Cache management utilities
export const cacheUtils = {
  // Clear all caches
  async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  },

  // Get cache size
  async getCacheSize(): Promise<number> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    }
    return 0;
  },

  // Force cache refresh
  async refreshCache(pattern: RegExp): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();

        for (const request of requests) {
          if (pattern.test(request.url)) {
            await cache.delete(request);
          }
        }
      }
    }
  }
};

// Performance monitoring for service worker
export const performanceMonitoring = {
  // Measure service worker registration time
  measureRegistrationTime: (startTime: number) => {
    const endTime = performance.now();
    console.log(`[SW] Registration took ${endTime - startTime}ms`);
  },

  // Monitor cache hit ratio
  trackCacheHit: (url: string, hit: boolean) => {
    const key = 'cache-stats';
    const stats = JSON.parse(localStorage.getItem(key) || '{}');

    stats[url] = stats[url] || { hits: 0, misses: 0 };
    if (hit) {
      stats[url].hits++;
    } else {
      stats[url].misses++;
    }

    localStorage.setItem(key, JSON.stringify(stats));
  },

  // Get cache statistics
  getCacheStats: () => {
    const key = 'cache-stats';
    return JSON.parse(localStorage.getItem(key) || '{}');
  }
};

export default {
  register,
  unregister,
  cacheUtils,
  performanceMonitoring,
};