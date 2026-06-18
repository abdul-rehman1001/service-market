import type { Prisma, UserStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';

/**
 * Booking states that are still "live" and must be cancelled when an account is
 * suspended or deleted. Terminal states (COMPLETED / CANCELLED / AUTO_CANCELLED)
 * are intentionally left untouched so booking history is preserved for the
 * other party.
 */
export const ACTIVE_BOOKING_STATUSES = [
  'HOLD',
  'PENDING',
  'CONFIRMED',
  'EN_ROUTE',
  'IN_PROGRESS',
] as const;

export type DeactivationMode = Extract<UserStatus, 'SUSPENDED' | 'DELETED'>;

export interface DeactivationResult {
  mode: DeactivationMode;
  cancelledBookings: number;
}

interface DeactivateOptions {
  mode: DeactivationMode;
  /** Optional cancellation reason shown to the counterparties. */
  reason?: string;
}

function defaultReason(mode: DeactivationMode): string {
  return mode === 'DELETED'
    ? 'The account linked to this booking was removed by the Servizo team.'
    : 'The account linked to this booking was suspended by the Servizo team.';
}

function formatSchedule(date: Date | null): string {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Karachi',
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function buildBookingCancelledEmail(params: {
  recipientName: string;
  bookingNumber: string;
  serviceName: string;
  scheduledStart: Date | null;
  reason: string;
}): string {
  const { recipientName, bookingNumber, serviceName, scheduledStart, reason } = params;
  const schedule = formatSchedule(scheduledStart);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Booking Cancelled</h2>
      <p>Dear ${recipientName || 'there'},</p>
      <p>Your booking <strong>#${bookingNumber}</strong>${
        serviceName ? ` for <strong>${serviceName}</strong>` : ''
      }${schedule ? ` scheduled for <strong>${schedule}</strong>` : ''} has been cancelled.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>We apologise for the inconvenience. You are welcome to book another available provider on Servizo.</p>
      <br/>
      <p style="color: #6b7280; font-size: 0.875rem;">– The Servizo Team</p>
    </div>
  `;
}

function buildAccountStatusEmail(params: {
  name: string;
  mode: DeactivationMode;
  cancelledBookings: number;
}): string {
  const { name, mode, cancelledBookings } = params;
  const isDeleted = mode === 'DELETED';
  const heading = isDeleted ? 'Account Deleted' : 'Account Suspended';
  const intro = isDeleted
    ? 'Your account on <strong>Servizo</strong> has been deleted by an administrator and can no longer be used to sign in.'
    : 'Your account on <strong>Servizo</strong> has been suspended by an administrator. You will not be able to sign in until it is reinstated.';

  const bookingsLine =
    cancelledBookings > 0
      ? `<p>As a result, <strong>${cancelledBookings}</strong> of your active booking${
          cancelledBookings === 1 ? ' has' : 's have'
        } been cancelled and the other parties have been notified.</p>`
      : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">${heading}</h2>
      <p>Dear ${name || 'there'},</p>
      <p>${intro}</p>
      ${bookingsLine}
      <p>If you believe this was done in error, please contact our support team.</p>
      <br/>
      <p style="color: #6b7280; font-size: 0.875rem;">– The Servizo Team</p>
    </div>
  `;
}

/**
 * Suspends or soft-deletes a user account in a single atomic operation:
 *
 * 1. Cancels every active booking the user is part of — as a seeker AND, if they
 *    have a provider profile, as a provider. Terminal/historical bookings are
 *    left intact so the counterparty keeps full history.
 * 2. Sets the user's status (SUSPENDED or DELETED).
 * 3. Revokes all refresh tokens so the session cannot be renewed (logout).
 * 4. Notifies + emails both parties for each cancelled booking, and emails the
 *    affected user a summary. Email/push failures never abort the operation.
 *
 * This is intentionally a *soft* delete: the User and Booking rows are kept so a
 * provider's (or seeker's) booking history is never affected when the other
 * account is suspended or deleted.
 */
export async function deactivateUserAccount(
  userId: string,
  options: DeactivateOptions
): Promise<DeactivationResult> {
  const { mode } = options;
  const reason = options.reason?.trim() || defaultReason(mode);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      providerProfile: { select: { id: true } },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const providerId = user.providerProfile?.id ?? null;

  const bookingWhere: Prisma.BookingWhereInput = {
    status: { in: [...ACTIVE_BOOKING_STATUSES] },
    ...(providerId
      ? { OR: [{ seekerId: userId }, { providerId }] }
      : { seekerId: userId }),
  };

  const activeBookings = await prisma.booking.findMany({
    where: bookingWhere,
    select: {
      id: true,
      bookingNumber: true,
      scheduledStart: true,
      service: { select: { name: true } },
      seeker: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
      provider: {
        select: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  const bookingIds = activeBookings.map((booking) => booking.id);

  await prisma.$transaction(async (tx) => {
    if (bookingIds.length > 0) {
      await tx.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: {
          status: 'CANCELLED',
          cancelledBy: 'ADMIN',
          cancellationReason: reason,
        },
      });
    }

    await tx.user.update({
      where: { id: userId },
      data: { status: mode },
    });

    // Revoke all sessions so the access token can no longer be refreshed.
    await tx.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  // Best-effort side effects — must never roll back or fail the deactivation.
  await Promise.allSettled(
    activeBookings.flatMap((booking) => {
      const notificationData = {
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service?.name || '',
        bookingId: booking.id,
        reason,
        cancelledBy: 'ADMIN',
      };

      const tasks: Promise<unknown>[] = [];

      if (booking.seeker?.id) {
        tasks.push(
          sendNotification({
            userId: booking.seeker.id,
            type: 'BOOKING_CANCELLED',
            bookingId: booking.id,
            data: notificationData,
          })
        );
      }

      const providerUser = booking.provider?.user;
      if (providerUser?.id) {
        tasks.push(
          sendNotification({
            userId: providerUser.id,
            type: 'BOOKING_CANCELLED',
            bookingId: booking.id,
            data: notificationData,
          })
        );
      }

      if (booking.seeker?.email) {
        tasks.push(
          sendEmail(
            booking.seeker.email,
            `Booking #${booking.bookingNumber} cancelled`,
            buildBookingCancelledEmail({
              recipientName: `${booking.seeker.firstName} ${booking.seeker.lastName}`.trim(),
              bookingNumber: booking.bookingNumber,
              serviceName: booking.service?.name || '',
              scheduledStart: booking.scheduledStart,
              reason,
            })
          )
        );
      }

      if (providerUser?.email) {
        tasks.push(
          sendEmail(
            providerUser.email,
            `Booking #${booking.bookingNumber} cancelled`,
            buildBookingCancelledEmail({
              recipientName: `${providerUser.firstName} ${providerUser.lastName}`.trim(),
              bookingNumber: booking.bookingNumber,
              serviceName: booking.service?.name || '',
              scheduledStart: booking.scheduledStart,
              reason,
            })
          )
        );
      }

      return tasks;
    })
  );

  try {
    await sendEmail(
      user.email,
      mode === 'DELETED'
        ? 'Your Servizo account has been deleted'
        : 'Your Servizo account has been suspended',
      buildAccountStatusEmail({
        name: `${user.firstName} ${user.lastName}`.trim(),
        mode,
        cancelledBookings: bookingIds.length,
      })
    );
  } catch (error) {
    console.error('Failed to send account status email:', error);
  }

  return { mode, cancelledBookings: bookingIds.length };
}
