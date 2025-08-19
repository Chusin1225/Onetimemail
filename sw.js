// Minimal Service Worker for notifications (no app installation prompts)
self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Become active SW for current clients
  event.waitUntil(self.clients.claim());
});

// Handle notifications clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Optional: handle push payloads (for future real Web Push integration)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Onetimemail';
  const options = {
    body: data.body || 'Tienes un nuevo mensaje',
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'onetimemail',
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
