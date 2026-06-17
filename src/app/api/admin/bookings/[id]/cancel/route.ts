import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notifications';

/**
 * POST /api/admin/bookings/:id/cancel
 * Cancel a booking as Admin
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        bookingNumber: true,
        seekerId: true,
        provider: { select: { userId: true } },
        service: { select: { name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.provider?.userId) {
      return NextResponse.json({ error: 'Provider not found for booking' }, { status: 404 });
    }

    // Only allow cancellation of non-terminal bookings
    if (['COMPLETED', 'CANCELLED', 'AUTO_CANCELLED'].includes(booking.status)) {
      return NextResponse.json(
        { error: `Cannot cancel a booking with status ${booking.status}` },
        { status: 400 }
      );
    }

    const trimmedReason = reason.trim();

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: 'ADMIN',
        cancellationReason: trimmedReason,
      },
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        cancelledBy: true,
        cancellationReason: true,
      },
    });

    const notificationData = {
      bookingNumber: updated.bookingNumber,
      serviceName: booking.service?.name || '',
      bookingId: id,
      reason: trimmedReason,
      cancelledBy: 'ADMIN',
    };

    sendNotification({
      userId: booking.seekerId,
      type: 'BOOKING_CANCELLED',
      bookingId: id,
      data: notificationData,
    });

    sendNotification({
      userId: booking.provider.userId,
      type: 'BOOKING_CANCELLED',
      bookingId: id,
      data: notificationData,
    });

    return NextResponse.json({
      message: `Booking ${updated.bookingNumber} cancelled successfully`,
      booking: updated,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking', details: error.message },
      { status: 500 }
    );
  }
}
