import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/reviews/:id
 * Get full review details (Admin only)
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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            scheduledStart: true,
            location: true,
            service: {
              select: {
                id: true,
                name: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/:id
 * Permanently delete an inappropriate review (Admin only)
 */
export async function DELETE(
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

    // Fetch the review to get provider info before deletion
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        rating: true,
        revieweeId: true,
        booking: {
          select: {
            provider: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const providerId = review.booking.provider.id;

    // Delete the review
    await prisma.review.delete({ where: { id } });

    // Recalculate provider's average rating and totalReviews
    const stats = await prisma.review.aggregate({
      where: {
        booking: { providerId },
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        totalReviews: stats._count.rating,
      },
    });

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review', details: error.message },
      { status: 500 }
    );
  }
}
