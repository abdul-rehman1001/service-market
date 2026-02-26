import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { autoCancelExpiredBookings, cancelExpiredHolds } from '@/lib/bookings';

export async function GET(req: NextRequest) {
  try {
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
        { error: 'Only providers can access bookings' },
        { status: 403 }
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

    await autoCancelExpiredBookings(prisma);
    await cancelExpiredHolds(prisma);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const statusFilter = statusParam
      ? statusParam.split(',').map((value) => value.trim())
      : undefined;

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: provider.id,
        ...(statusFilter ? { status: { in: statusFilter as any[] } } : {}),
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
      orderBy: { scheduledStart: 'desc' },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Provider bookings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
