import { NextResponse } from 'next/server';

function getRequiredPublicEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function GET() {
  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  const config = {
    apiKey: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
    authDomain: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
    projectId: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
    storageBucket: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getRequiredPublicEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
    ...(measurementId ? { measurementId } : {}),
  };

  const swSource = `/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp(${JSON.stringify(config)});

const messaging = firebase.messaging();

  // Ensure event handlers are registered during initial evaluation
  self.addEventListener('push', () => {});
  self.addEventListener('pushsubscriptionchange', () => {});

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
`;

  return new NextResponse(swSource, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
      'Service-Worker-Allowed': '/',
    },
  });
}
