
// Service Worker for DisciplineOS - Background monitoring and notifications
const CACHE_NAME = 'disciplineos-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Background sync for behavioral data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-behavior') {
    event.waitUntil(syncBehavioralData());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      vibrate: [200, 100, 200],
      tag: 'disciplineos-intervention',
      requireInteraction: true,
      actions: [
        {
          action: 'start-session',
          title: 'Start Session'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'start-session') {
    event.waitUntil(
      clients.openWindow('/?startSession=true')
    );
  } else if (event.action === 'dismiss') {
    // Log dismissal for AI learning
    event.waitUntil(
      fetch('/api/log-dismissal', {
        method: 'POST',
        body: JSON.stringify({ timestamp: Date.now() })
      })
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background monitoring function
async function syncBehavioralData() {
  try {
    // This would sync with IndexedDB or server
    console.log('[SW] Syncing behavioral data in background');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Periodic background monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'START_BACKGROUND_MONITORING') {
    startBackgroundMonitoring();
  }
});

function startBackgroundMonitoring() {
  // Monitor in background when app is closed
  setInterval(() => {
    console.log('[SW] Background monitoring active');
  }, 30000); // Every 30 seconds
}
