/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDWpIzMvAiqKgXHeAUh1PadeFSFO1i2_-U",
  authDomain: "service-app-b89b3.firebaseapp.com",
  projectId: "service-app-b89b3",
  storageBucket: "service-app-b89b3.firebasestorage.app",
  messagingSenderId: "1091116913641",
  appId: "1:1091116913641:web:f5f5b9e8bf2c355548b178",
});

const messaging = firebase.messaging();

// Handle background push notifications (when tab is closed or in background)
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Servizo';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/images/logo-icon.png',
    badge: '/images/logo-icon.png',
    data: payload.data || {},
    tag: payload.data?.notificationId || 'default',
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if found
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new tab
      return clients.openWindow(url);
    })
  );
});
