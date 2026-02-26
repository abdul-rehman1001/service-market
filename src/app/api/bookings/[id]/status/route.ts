import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

type BookingStatus =
  | 'HOLD'
  | 'PENDING'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'AUTO_CANCELLED';

interface StatusUpdateRequest {
  status: BookingStatus;
  cancellationReason?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Define valid state transitions for providers
const validTransitions: Record<BookingStatus, BookingStatus[]> = {
  HOLD: [],
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  AUTO_CANCELLED: [],
};

export async function PATCH(
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

    // Only providers can update booking status
    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can update booking status' },
        { status: 403 }
      );
    }

    const body = (await req.json()) as StatusUpdateRequest;
    const { status: newStatus, cancellationReason } = body;

    if (!newStatus || typeof newStatus !== 'string') {
      return NextResponse.json(
        { error: 'status field is required' },
        { status: 400 }
      );
    }

    // Validate it's a valid status
    const validStatuses: BookingStatus[] = [
      'HOLD',
      'PENDING',
      'CONFIRMED',
      'EN_ROUTE',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'AUTO_CANCELLED',
    ];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${newStatus}` },
        { status: 400 }
      );
    }

    // Require cancellation reason if transitioning to CANCELLED
    if (newStatus === 'CANCELLED' && !cancellationReason) {
      return NextResponse.json(
        { error: 'cancellationReason is required when cancelling' },
        { status: 400 }
      );
    }

    // Find provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Get booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        provider: true,
        seeker: { select: { id: true, firstName: true, lastName: true } },
        service: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this booking' },
        { status: 403 }
      );
    }

    const currentStatus = booking.status as BookingStatus;

    // Validate state transition
    const allowedTransitions = validTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
        },
        { status: 409 }
      );
    }

    // Perform the status update
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: newStatus,
        ...(newStatus === 'CANCELLED' && {
          cancellationReason,
          cancelledBy: 'PROVIDER',
        }),
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

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Booking status update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking status' },
      { status: 500 }
    );
  }
}
