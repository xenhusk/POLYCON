// Service Worker for better notification handling on mobile
// This helps with background notifications and improved mobile support

const CACHE_NAME = 'polycon-notifications-v1';

// Install event - setup cache
self.addEventListener('install', (event) => {
  console.log('📱 Notification Service Worker installed');
  self.skipWaiting();
});

// Activate event - take control
self.addEventListener('activate', (event) => {
  console.log('📱 Notification Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked in service worker:', event);
  
  const notification = event.notification;
  const action = event.action;
  
  notification.close();
  
  // Handle different actions
  if (action === 'view' || !action) {
    // Open or focus the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            if (action === 'view') {
              client.postMessage({ action: 'navigate', path: '/appointments' });
            }
            return;
          }
        }
        // If no window is open, open a new one
        self.clients.openWindow(self.location.origin + '/#/appointments');
      })
    );
  } else if (action === 'dismiss') {
    // Just close the notification (already closed above)
    console.log('🔔 Notification dismissed');
  }
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('🔔 Notification closed:', event.notification.tag);
});

// Handle background sync for offline notifications (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-notification') {
    console.log('🔔 Background sync for notifications');
    // Handle background notification logic here if needed
  }
});

// Handle push events for future push notification support
self.addEventListener('push', (event) => {
  console.log('📨 Push event received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from POLYCON',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('POLYCON', options)
  );
});
