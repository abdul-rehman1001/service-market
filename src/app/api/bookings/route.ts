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

    await autoCancelExpiredBookings(prisma);
    await cancelExpiredHolds(prisma);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');
    const statusFilter = statusParam
      ? statusParam.split(',').map((value) => value.trim())
      : undefined;

    const bookings = await prisma.booking.findMany({
      where: {
        seekerId: decoded.userId,
        ...(statusFilter ? { status: { in: statusFilter as any[] } } : {}),
      },
      include: {
        provider: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
            businessName: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            minPrice: true,
            maxPrice: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
      },
      orderBy: { scheduledStart: 'desc' },
    });

    // Convert Decimal types to numbers for client component compatibility
    const convertedBookings = bookings.map((booking) => ({
      ...booking,
      service: {
        ...booking.service,
        minPrice: Number(booking.service.minPrice),
        maxPrice: Number(booking.service.maxPrice),
      },
      provider: {
        ...booking.provider,
        averageRating: Number(booking.provider.averageRating),
      },
    }));

    return NextResponse.json({ bookings: convertedBookings }, { status: 200 });
  } catch (error) {
    console.error('User bookings GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
