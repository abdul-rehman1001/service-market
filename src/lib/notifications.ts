import admin from './firebaseAdmin';
import prisma from './prisma';

type NotificationType =
  | 'BOOKING_REQUEST'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_RESCHEDULED'
  | 'REMINDER_24H'
  | 'REMINDER_2H'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'VERIFICATION_STATUS_CHANGED'
  | 'SYSTEM_UPDATE';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  bookingId?: string;
  data?: Record<string, string>;
}

// Get notification title and body based on type
function getNotificationContent(type: NotificationType, data?: Record<string, string>) {
  const bookingNumber = data?.bookingNumber || '';
  const serviceName = data?.serviceName || '';

  const map: Record<NotificationType, { title: string; body: string }> = {
    BOOKING_REQUEST: {
      title: 'New Booking Request',
      body: `New booking request${serviceName ? ` for ${serviceName}` : ''}${bookingNumber ? ` (#${bookingNumber})` : ''}.`,
    },
    BOOKING_CONFIRMED: {
      title: 'Booking Confirmed',
      body: `Your booking${bookingNumber ? ` #${bookingNumber}` : ''}${serviceName ? ` for ${serviceName}` : ''} has been confirmed.`,
    },
    BOOKING_CANCELLED: {
      title: 'Booking Cancelled',
      body: `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been cancelled.${data?.reason ? ` Reason: ${data.reason}` : ''}`,
    },
    BOOKING_RESCHEDULED: {
      title: 'Booking Rescheduled',
      body: `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been rescheduled.`,
    },
    REMINDER_24H: {
      title: 'Booking Tomorrow',
      body: `Reminder: Your booking${bookingNumber ? ` #${bookingNumber}` : ''} is scheduled for tomorrow.`,
    },
    REMINDER_2H: {
      title: 'Booking in 2 Hours',
      body: `Reminder: Your booking${bookingNumber ? ` #${bookingNumber}` : ''} starts in 2 hours.`,
    },
    EN_ROUTE: {
      title: 'Provider En Route',
      body: `The provider is on their way for booking${bookingNumber ? ` #${bookingNumber}` : ''}.`,
    },
    IN_PROGRESS: {
      title: 'Service In Progress',
      body: `Work has started on booking${bookingNumber ? ` #${bookingNumber}` : ''}.`,
    },
    COMPLETED: {
      title: 'Service Completed',
      body: `Booking${bookingNumber ? ` #${bookingNumber}` : ''} has been completed. Please leave a review!`,
    },
    REVIEW_RECEIVED: {
      title: 'New Review Received',
      body: `You received a ${data?.rating ? `${data.rating}-star` : 'new'} review${serviceName ? ` for ${serviceName}` : ''}.`,
    },
    VERIFICATION_STATUS_CHANGED: {
      title: 'Verification Status Updated',
      body: `Your verification status has been changed to: ${data?.status || 'updated'}.`,
    },
    SYSTEM_UPDATE: {
      title: 'System Update',
      body: data?.message || 'There is an important system update.',
    },
  };

  return map[type];
}

// Get URL for notification click
function getNotificationUrl(type: NotificationType, data?: Record<string, string>) {
  const bookingId = data?.bookingId || '';

  switch (type) {
    case 'BOOKING_REQUEST':
      return '/provider/dashboard?tab=bookings';
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'BOOKING_RESCHEDULED':
    case 'REMINDER_24H':
    case 'REMINDER_2H':
    case 'EN_ROUTE':
    case 'IN_PROGRESS':
    case 'COMPLETED':
      return '/bookings';
    case 'REVIEW_RECEIVED':
      return '/provider/dashboard?tab=reviews';
    case 'VERIFICATION_STATUS_CHANGED':
      return '/provider/dashboard?tab=verify-identity';
    case 'SYSTEM_UPDATE':
      return '/';
    default:
      return '/';
  }
}

/**
 * Send a notification to a user:
 * 1. Save to database (Notification model)
 * 2. Send FCM push notification if user has a registered token
 */
export async function sendNotification({ userId, type, bookingId, data }: SendNotificationParams) {
  try {
    // 1. Save notification to DB
    await prisma.notification.create({
      data: {
        userId,
        type,
        bookingId: bookingId || null,
      },
    });

    // 2. Get user's FCM tokens from Firestore
    const tokensSnapshot = await admin.firestore()
      .collection('fcmTokens')
      .where('userId', '==', userId)
      .get();

    if (tokensSnapshot.empty) return;

    const { title, body } = getNotificationContent(type, data);
    const url = getNotificationUrl(type, data);

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

    // 3. Send push to all registered devices
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      webpush: {
        fcmOptions: {
          link: url,
        },
        notification: {
          title,
          body,
          icon: '/images/logo-icon.png',
          badge: '/images/logo-icon.png',
          requireInteraction: true,
        },
      },
      data: {
        type,
        url,
        ...(bookingId ? { bookingId } : {}),
        ...(data || {}),
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        const batch = admin.firestore().batch();
        for (const token of invalidTokens) {
          const snap = await admin.firestore()
            .collection('fcmTokens')
            .where('token', '==', token)
            .get();
          snap.docs.forEach((doc) => batch.delete(doc.ref));
        }
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Send a chat message notification via FCM
 */
export async function sendChatNotification({
  recipientUserId,
  senderName,
  messagePreview,
  bookingId,
}: {
  recipientUserId: string;
  senderName: string;
  messagePreview: string;
  bookingId: string;
}) {
  try {
    const tokensSnapshot = await admin.firestore()
      .collection('fcmTokens')
      .where('userId', '==', recipientUserId)
      .get();

    if (tokensSnapshot.empty) return;

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);
    const preview = messagePreview.length > 80 ? messagePreview.slice(0, 80) + '…' : messagePreview;

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: senderName,
        body: preview,
      },
      webpush: {
        fcmOptions: {
          link: `/messages?bookingId=${bookingId}`,
        },
        notification: {
          title: senderName,
          body: preview,
          icon: '/images/logo-icon.png',
          tag: `chat-${bookingId}`,
        },
      },
      data: {
        type: 'CHAT_MESSAGE',
        senderName,
        messagePreview: preview,
        bookingId,
        url: `/messages?bookingId=${bookingId}`,
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const batch = admin.firestore().batch();
      response.responses.forEach(async (resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            const snap = await admin.firestore()
              .collection('fcmTokens')
              .where('token', '==', tokens[idx])
              .get();
            snap.docs.forEach((doc) => batch.delete(doc.ref));
          }
        }
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Failed to send chat notification:', error);
  }
}
