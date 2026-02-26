import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { autoCancelExpiredBookings, cancelExpiredHolds } from '@/lib/bookings';

export async function GET(
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

    await autoCancelExpiredBookings(prisma);
    await cancelExpiredHolds(prisma);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, name: true } },
        provider: { select: { id: true, userId: true } },
        seeker: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (decoded.role === 'ADMIN') {
      return NextResponse.json({ booking }, { status: 200 });
    }

    if (decoded.role === 'SEEKER' && booking.seekerId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (decoded.role === 'PROVIDER') {
      const provider = await prisma.serviceProvider.findUnique({
        where: { userId: decoded.userId },
        select: { id: true },
      });

      if (!provider || booking.providerId !== provider.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
