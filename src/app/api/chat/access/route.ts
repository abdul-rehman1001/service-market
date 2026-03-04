import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET /api/chat/access?bookingId=xxx — check if current user can chat for this booking
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const bookingId = req.nextUrl.searchParams.get('bookingId');
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: { select: { userId: true } },
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isSeeker = booking.seekerId === decoded.userId;
    const isProvider = booking.provider.userId === decoded.userId;

    if (!isSeeker && !isProvider) {
      return NextResponse.json({ allowed: false, reason: 'Not a participant' }, { status: 403 });
    }

    const allowedStatuses = ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
    if (!allowedStatuses.includes(booking.status)) {
      return NextResponse.json(
        { allowed: false, reason: 'Booking must be confirmed to start chatting' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        allowed: true,
        userId: decoded.userId,
        bookingStatus: booking.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat access check error:', error);
    return NextResponse.json({ error: 'Failed to check access' }, { status: 500 });
  }
}
