import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notifications';

interface ReviewRequest {
  rating: number;
  comment?: string;
  professionalism?: number;
  punctuality?: number;
  qualityOfWork?: number;
  communication?: number;
  valueForMoney?: number;
}

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
    const { id: bookingId } = await params;
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = (await req.json()) as ReviewRequest;
    const { rating, comment, professionalism, punctuality, qualityOfWork, communication, valueForMoney } = body;

    // Validate rating
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment && comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must not exceed 500 characters' },
        { status: 400 }
      );
    }

    // Validate optional ratings
    const optionalRatings = [professionalism, punctuality, qualityOfWork, communication, valueForMoney];
    for (const optRating of optionalRatings) {
      if (optRating !== undefined && (typeof optRating !== 'number' || optRating < 1 || optRating > 5 || !Number.isInteger(optRating))) {
        return NextResponse.json(
          { error: 'All ratings must be integers between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get booking
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          provider: true,
          review: true,
        },
      });

      if (!booking) {
        throw new ApiError('Booking not found', 404);
      }

      // Check if user is the seeker
      if (booking.seekerId !== decoded.userId) {
        throw new ApiError('Only the booking owner can leave a review', 403);
      }

      // Check if booking is completed
      if (booking.status !== 'COMPLETED') {
        throw new ApiError('Only completed bookings can be reviewed', 400);
      }

      // Check if review already exists
      if (booking.review) {
        throw new ApiError('A review already exists for this booking', 409);
      }

      // Get provider user ID (reviewee)
      const provider = await tx.serviceProvider.findUnique({
        where: { id: booking.providerId },
        select: { userId: true, totalReviews: true, averageRating: true },
      });

      if (!provider) {
        throw new ApiError('Provider not found', 404);
      }

      // Create review
      const review = await tx.review.create({
        data: {
          bookingId,
          reviewerId: decoded.userId,
          revieweeId: provider.userId,
          rating,
          comment: comment || null,
          professionalism,
          punctuality,
          qualityOfWork,
          communication,
          valueForMoney,
        },
      });

      // Calculate new average rating
      const currentTotal = Number(provider.averageRating) * provider.totalReviews;
      const newTotal = currentTotal + rating;
      const newReviewCount = provider.totalReviews + 1;
      const newAverageRating = newTotal / newReviewCount;

      // Update provider stats
      await tx.serviceProvider.update({
        where: { id: booking.providerId },
        data: {
          totalReviews: newReviewCount,
          averageRating: newAverageRating,
        },
      });

      return review;
    });

    // Notify the provider about the review
    const reviewedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: { select: { userId: true } },
        service: { select: { name: true } },
      },
    });

    if (reviewedBooking) {
      sendNotification({
        userId: reviewedBooking.provider.userId,
        type: 'REVIEW_RECEIVED',
        bookingId,
        data: {
          rating: String(body.rating),
          serviceName: reviewedBooking.service?.name || '',
          bookingId,
        },
      });
    }

    return NextResponse.json({ review: result }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
