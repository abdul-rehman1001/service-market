import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/bookings/:id
 * Get full booking details (Admin only)
 */
export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            minPrice: true,
            maxPrice: true,
            defaultDurationMinutes: true,
            category: {
              select: { id: true, name: true },
            },
          },
        },
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            address: true,
            city: true,
          },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            averageRating: true,
            totalReviews: true,
            totalJobsCompleted: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        },
        providerResponse: {
          select: {
            type: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking', details: error.message },
      { status: 500 }
    );
  }
}
