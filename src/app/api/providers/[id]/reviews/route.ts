import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;

    // Get pagination parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Verify provider exists
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { 
        id: true, 
        userId: true,
        averageRating: true,
        totalReviews: true,
      },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get reviews for this provider (reviewee)
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          revieweeId: provider.userId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          booking: {
            select: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          revieweeId: provider.userId,
        },
      }),
    ]);

    // Convert formatted reviews
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      professionalism: review.professionalism,
      punctuality: review.punctuality,
      qualityOfWork: review.qualityOfWork,
      communication: review.communication,
      valueForMoney: review.valueForMoney,
      createdAt: review.createdAt.toISOString(),
      reviewer: {
        id: review.reviewer.id,
        firstName: review.reviewer.firstName,
        lastName: review.reviewer.lastName,
        profileImage: review.reviewer.profileImage,
      },
      serviceName: review.booking?.service?.name || 'Service',
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        reviews: formattedReviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
        summary: {
          averageRating: Number(provider.averageRating),
          totalReviews: provider.totalReviews,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider reviews GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
