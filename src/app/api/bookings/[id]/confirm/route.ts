import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { assertAccountCanAct } from '@/lib/accountAccess';
import { PROVIDER_RESPONSE_MINUTES, cancelExpiredHolds } from '@/lib/bookings';
import { sendNotification } from '@/lib/notifications';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'SEEKER') {
      return NextResponse.json(
        { error: 'Only seekers can confirm bookings' },
        { status: 403 }
      );
    }

    const accountCheck = await assertAccountCanAct(auth.userId);
    if (!accountCheck.ok) {
      return NextResponse.json(
        { error: accountCheck.message, code: 'ACCOUNT_SUSPENDED' },
        { status: 403 }
      );
    }

    const now = new Date();

    const booking = await prisma.$transaction(async (tx) => {
      await cancelExpiredHolds(tx);

      const existing = await tx.booking.findUnique({ where: { id } });
      if (!existing) {
        throw new ApiError('Booking not found', 404);
      }

      if (existing.seekerId !== auth.userId) {
        throw new ApiError('Unauthorized', 403);
      }

      if (existing.status !== 'HOLD') {
        throw new ApiError('Booking is not in HOLD status', 409);
      }

      if (existing.holdExpiresAt && existing.holdExpiresAt <= now) {
        await tx.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            cancellationReason: 'Hold expired',
            cancelledBy: 'ADMIN',
          },
        });
        throw new ApiError('Hold has expired', 409);
      }

      const overlap = await tx.booking.findFirst({
        where: {
          providerId: existing.providerId,
          id: { not: existing.id },
          AND: [
            {
              OR: [
                { status: { in: ['CONFIRMED', 'PENDING'] } },
                { status: 'HOLD', holdExpiresAt: { gt: now } },
              ],
            },
            { scheduledStart: { lt: existing.scheduledEnd } },
            { scheduledEnd: { gt: existing.scheduledStart } },
          ],
        },
      });

      if (overlap) {
        throw new ApiError('Selected slot overlaps with an existing booking', 409);
      }

      const providerResponseDeadline = new Date(
        now.getTime() + PROVIDER_RESPONSE_MINUTES * 60000
      );

      return tx.booking.update({
        where: { id },
        data: {
          status: 'PENDING',
          holdExpiresAt: null,
          providerResponseDeadline,
          responseDeadline: providerResponseDeadline,
        },
      });
    });

    // Notify the provider about the new booking request
    const confirmedBooking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true } },
        service: { select: { name: true } },
      },
    });

    if (confirmedBooking) {
      sendNotification({
        userId: confirmedBooking.provider.userId,
        type: 'BOOKING_REQUEST',
        bookingId: id,
        data: {
          bookingNumber: confirmedBooking.bookingNumber || '',
          serviceName: confirmedBooking.service?.name || '',
          bookingId: id,
        },
      });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Booking confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
