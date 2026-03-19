import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { autoCancelExpiredBookings } from '@/lib/bookings';
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
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can respond to bookings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { type } = body as { type?: 'ACCEPT' | 'REJECT' };

    if (!type || !['ACCEPT', 'REJECT'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be ACCEPT or REJECT' },
        { status: 400 }
      );
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const booking = await prisma.$transaction(async (tx) => {
      await autoCancelExpiredBookings(tx);

      const existing = await tx.booking.findUnique({ where: { id } });
      if (!existing) {
        throw new ApiError('Booking not found', 404);
      }

      if (existing.providerId !== provider.id) {
        throw new ApiError('Unauthorized', 403);
      }

      if (type === 'ACCEPT') {
        if (existing.status !== 'PENDING') {
          throw new ApiError('Booking is not pending', 409);
        }

        if (existing.providerResponseDeadline && existing.providerResponseDeadline <= new Date()) {
          await tx.booking.update({
            where: { id },
            data: {
              status: 'AUTO_CANCELLED',
              cancellationReason: 'Auto cancelled due to no response',
              cancelledBy: 'ADMIN',
            },
          });
          throw new ApiError('Provider response window expired', 409);
        }

        return tx.booking.update({
          where: { id },
          data: { status: 'CONFIRMED' },
          include: {
            seeker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }

      return tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancellationReason: 'Rejected by provider',
          cancelledBy: 'PROVIDER',
        },
        include: {
          seeker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    // Send notification to seeker
    if (type === 'ACCEPT') {
      sendNotification({
        userId: booking.seeker.id,
        type: 'BOOKING_CONFIRMED',
        bookingId: id,
        data: {
          bookingNumber: booking.bookingNumber || '',
          serviceName: booking.service?.name || '',
          bookingId: id,
        },
      });
      // Also notify the provider
      sendNotification({
        userId: decoded.userId,
        type: 'BOOKING_CONFIRMED',
        bookingId: id,
        data: {
          bookingNumber: booking.bookingNumber || '',
          serviceName: booking.service?.name || '',
          bookingId: id,
        },
      });
    } else {
      sendNotification({
        userId: booking.seeker.id,
        type: 'BOOKING_CANCELLED',
        bookingId: id,
        data: {
          bookingNumber: booking.bookingNumber || '',
          serviceName: booking.service?.name || '',
          bookingId: id,
          reason: 'Rejected by provider',
        },
      });
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Provider booking respond error:', error);
    return NextResponse.json(
      { error: 'Failed to respond to booking' },
      { status: 500 }
    );
  }
}
