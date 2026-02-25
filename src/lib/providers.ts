import prisma from './prisma';

/**
 * Fetch top-rated providers for the homepage
 * 
 * Requirements:
 * - Get providers from ServiceProvider table
 * - Only include providers where:
 *   - verificationStatus is APPROVED
 *   - isAvailable is true
 * - Order by averageRating (descending) and totalReviews (descending)
 * - Take 6 providers
 * 
 * Include:
 * - user (firstName, lastName, profileImage, bio)
 * - services (only active services)
 */
export async function getTopRatedProviders(limit: number = 6) {
  try {
    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
      },
      orderBy: [
        {
          averageRating: 'desc',
        },
        {
          totalReviews: 'desc',
        },
      ],
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
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
          },
        },
      },
    });

    return providers;
  } catch (error) {
    console.error('Error fetching top-rated providers:', error);
    throw error;
  }
}

/**
 * Format provider data for frontend consumption
 */
export function formatProviderForDisplay(provider: any) {
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const mainService = provider.services[0];

  return {
    id: provider.id,
    name: fullName,
    role: mainService?.name || 'Service Provider',
    rating: parseFloat(provider.averageRating),
    reviews: provider.totalReviews,
    description:
      mainService?.description ||
      provider.user.bio ||
      'Professional service provider',
    avatar: provider.user.profileImage || '/images/avatar-placeholder.png',
    // Additional data for reference
    userId: provider.userId,
    mainService: mainService,
    allServices: provider.services,
  };
}
