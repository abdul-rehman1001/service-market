import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/providers
 *
 * Returns all approved and currently available providers.
 * Optional query:
 * - limit: number (optional, max 500)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(500, Math.max(1, Number(limitParam))) : null;

    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
      },
      ...(limit ? { take: limit } : {}),
      orderBy: {
        averageRating: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
            phone: true,
          },
        },
        services: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            minPrice: true,
            maxPrice: true,
            category: {
              select: {
                id: true,
                name: true,
                parentId: true,
              },
            },
          },
        },
      },
    });

    const formattedProviders = providers.map((provider) => ({
      id: provider.id,
      userId: provider.userId,
      name: provider.businessName || `${provider.user.firstName} ${provider.user.lastName}`,
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      profileImage: provider.user.profileImage,
      bio: provider.user.bio,
      rating: parseFloat(provider.averageRating.toString()),
      totalReviews: provider.totalReviews,
      totalJobsCompleted: provider.totalJobsCompleted,
      yearsOfExperience: provider.yearsOfExperience,
      baseAddress: provider.baseAddress,
      phone: provider.user.phone,
      latitude: parseFloat(provider.latitude.toString()),
      longitude: parseFloat(provider.longitude.toString()),
      minPrice:
        provider.services.length > 0
          ? Math.min(...provider.services.map((service) => parseFloat(service.minPrice.toString())))
          : null,
      services: provider.services,
      verificationStatus: provider.verificationStatus,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProviders,
      count: formattedProviders.length,
    });
  } catch (error: any) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
