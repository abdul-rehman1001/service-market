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
  const { providers } = await getTopRatedProvidersPage({ page: 1, limit });
  return providers;
}

export async function getTopRatedProvidersPage({
  page,
  limit,
  categoryId,
}: {
  page: number;
  limit: number;
  categoryId?: string | null;
}) {
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    let categoryIds: string[] | null = null;
    if (categoryId) {
      const children = await prisma.serviceCategory.findMany({
        where: { parentId: categoryId, isActive: true },
        select: { id: true },
      });
      categoryIds = [categoryId, ...children.map((c) => c.id)];
    }

    const where: any = {
      verificationStatus: 'APPROVED',
      isAvailable: true,
    };

    if (categoryIds) {
      where.services = {
        some: {
          categoryId: { in: categoryIds },
          isActive: true,
        },
      };
    }

    const total = await prisma.serviceProvider.count({ where });

    const providers = await prisma.serviceProvider.findMany({
      where,
      orderBy: [
        {
          averageRating: 'desc',
        },
        {
          totalReviews: 'desc',
        },
      ],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
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
            ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
          },
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return { providers, total, page: safePage, limit: safeLimit };
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
    rating: parseFloat(provider.averageRating?.toString?.() ?? String(provider.averageRating)),
    reviews: provider.totalReviews,
    description:
      mainService?.description ||
      provider.user.bio ||
      'Professional service provider',
    avatar: provider.user.profileImage || '/images/avatar1.png',
    // Additional data for reference
    userId: provider.userId,
    mainService: mainService,
    allServices: provider.services,
  };
}
