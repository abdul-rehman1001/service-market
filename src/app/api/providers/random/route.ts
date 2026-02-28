import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get total provider count
    const totalCount = await prisma.serviceProvider.count({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
      },
    });

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get random providers
    const skipRandom = Math.max(0, Math.floor(Math.random() * totalCount) - limit);

    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
      },
      skip: Math.max(0, skipRandom),
      take: limit,
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

    // Format providers
    const formattedProviders = providers.map((provider: { id: any; userId: any; businessName: any; user: { firstName: any; lastName: any; profileImage: any; bio: any; phone: any; }; averageRating: { toString: () => string; }; totalReviews: any; totalJobsCompleted: any; yearsOfExperience: any; baseAddress: any; latitude: { toString: () => string; }; longitude: { toString: () => string; }; services: any[]; verificationStatus: any; }) => ({
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
          ? Math.min(...provider.services.map((s) => parseFloat(s.minPrice.toString())))
          : null,
      services: provider.services,
      verificationStatus: provider.verificationStatus,
    }));

    return NextResponse.json({
      success: true,
      data: formattedProviders,
    });
  } catch (error: any) {
    console.error('Error fetching random providers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
