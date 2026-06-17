import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';

function requirePublicEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const vapidKey = requirePublicEnv(
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      'NEXT_PUBLIC_FIREBASE_VAPID_KEY'
    );
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Register the service worker (served by API route for env-backed config)
    const registration = await navigator.serviceWorker.register('/api/firebase-messaging-sw', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;

    const app = getFirebaseApp();
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const unsubscribe = onMessage(messaging, (payload) => {
    callback(payload);
  });

  return unsubscribe;
}

// Map NotificationType enum to user-friendly text and URL
export function getNotificationDetails(type: string, data?: Record<string, string>) {
  const bookingId = data?.bookingId || '';
  const bookingNumber = data?.bookingNumber || '';

  const map: Record<string, { title: string; body: string; url: string }> = {
    BOOKING_REQUEST: {
      title: 'New Booking Request',
      body: `You have a new booking request${bookingNumber ? ` #${bookingNumber}` : ''}.`,
      url: '/provider/dashboard?tab=bookings',
    },
    BOOKING_CONFIRMED: {
      title: 'Booking Confirmed',
      body: `Your booking${bookingNumber ? ` #${bookingNumber}` : ''} has been confirmed.`,
      url: bookingId ? `/bookings` : '/bookings',
    },
    BOOKING_CANCELLED: {
      title: 'Booking Cancelled',
      body:
        data?.cancelledBy === 'ADMIN'
          ? `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been cancelled by admin.${data?.reason ? ` Reason: ${data.reason}` : ''}`
          : `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been cancelled.${data?.reason ? ` Reason: ${data.reason}` : ''}`,
      url: '/bookings',
    },
    BOOKING_RESCHEDULED: {
      title: 'Booking Rescheduled',
      body: `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been rescheduled.`,
      url: '/bookings',
    },
    EN_ROUTE: {
      title: 'Provider En Route',
      body: `Your service provider is on the way for booking${bookingNumber ? ` #${bookingNumber}` : ''}.`,
      url: '/bookings',
    },
    IN_PROGRESS: {
      title: 'Service In Progress',
      body: `Work has started on your booking${bookingNumber ? ` #${bookingNumber}` : ''}.`,
      url: '/bookings',
    },
    COMPLETED: {
      title: 'Service Completed',
      body: `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been completed. Please leave a review!`,
      url: '/bookings',
    },
    REVIEW_RECEIVED: {
      title: 'New Review',
      body: 'You have received a new review.',
      url: '/provider/dashboard?tab=reviews',
    },
    VERIFICATION_STATUS_CHANGED: {
      title: 'Verification Update',
      body: `Your verification status has been updated.`,
      url: '/provider/dashboard?tab=verify-identity',
    },
    SYSTEM_UPDATE: {
      title: 'System Update',
      body: data?.message || 'There is a new system update.',
      url: '/',
    },
    CHAT_MESSAGE: {
      title: data?.senderName || 'New Message',
      body: data?.messagePreview || 'You have a new message.',
      url: bookingId ? `/messages?bookingId=${bookingId}` : '/messages',
    },
    REMINDER_24H: {
      title: 'Booking Reminder',
      body: `Your booking${bookingNumber ? ` #${bookingNumber}` : ''} is in 24 hours.`,
      url: '/bookings',
    },
    REMINDER_2H: {
      title: 'Booking Reminder',
      body: `Your booking${bookingNumber ? ` #${bookingNumber}` : ''} is in 2 hours.`,
      url: '/bookings',
    },
  };

  return map[type] || { title: 'Notification', body: 'You have a new notification.', url: '/' };
}
