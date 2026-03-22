import prisma from './prisma';

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sin1 = Math.sin(dLat / 2);
  const sin2 = Math.sin(dLng / 2);
  const h = sin1 * sin1 + Math.cos(lat1) * Math.cos(lat2) * sin2 * sin2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function normalizeHigherBetter(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 0.5;
  if (max <= min) return 1;
  return clamp01((value - min) / (max - min));
}

function normalizeLowerBetter(value: number, min: number, max: number) {
  const higherBetter = normalizeHigherBetter(value, min, max);
  return clamp01(1 - higherBetter);
}

async function resolveCategoryIds(categoryId: string | null | undefined) {
  if (!categoryId) return null;
  const children = await prisma.serviceCategory.findMany({
    where: { parentId: categoryId, isActive: true },
    select: { id: true },
  });
  return [categoryId, ...children.map((c) => c.id)];
}

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
  sort,
  userLocation,
}: {
  page: number;
  limit: number;
  categoryId?: string | null;
  sort?: 'top-rated' | 'combined';
  userLocation?: { lat: number; lng: number } | null;
}) {
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));

    const categoryIds = await resolveCategoryIds(categoryId);

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

    const sortMode = sort ?? 'top-rated';

    if (sortMode === 'combined') {
      // Rank across the full candidate set to keep pagination correct.
      // This does an in-memory sort; acceptable for typical homepage category sizes.
      const candidates = await prisma.serviceProvider.findMany({
        where,
        select: {
          id: true,
          averageRating: true,
          totalReviews: true,
          yearsOfExperience: true,
          latitude: true,
          longitude: true,
          services: {
            where: {
              isActive: true,
              ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
            },
            select: {
              minPrice: true,
            },
          },
        },
      });

      const prices: number[] = [];
      const distances: number[] = [];

      const enriched = candidates.map((p) => {
        const rating = Number(p.averageRating?.toString?.() ?? p.averageRating);
        const experience = Number(p.yearsOfExperience ?? 0);
        const price =
          p.services.length > 0
            ? Math.min(
                ...p.services.map((s) => Number(s.minPrice?.toString?.() ?? s.minPrice))
              )
            : null;

        const distanceKm =
          userLocation
            ? haversineKm(
                userLocation,
                {
                  lat: Number(p.latitude?.toString?.() ?? p.latitude),
                  lng: Number(p.longitude?.toString?.() ?? p.longitude),
                }
              )
            : null;

        if (price !== null && Number.isFinite(price)) prices.push(price);
        if (distanceKm !== null && Number.isFinite(distanceKm)) distances.push(distanceKm);

        return {
          id: p.id,
          rating,
          reviews: Number(p.totalReviews ?? 0),
          experience,
          price,
          distanceKm,
        };
      });

      const priceMin = prices.length ? Math.min(...prices) : 0;
      const priceMax = prices.length ? Math.max(...prices) : 0;
      const distMin = distances.length ? Math.min(...distances) : 0;
      const distMax = distances.length ? Math.max(...distances) : 0;

      const scored = enriched.map((p) => {
        // Rating: 0..5
        const ratingNorm = clamp01((p.rating || 0) / 5);

        // Experience: cap at 20 years for diminishing returns
        const experienceNorm = clamp01((p.experience || 0) / 20);

        // Price: cheaper is better (normalized within candidate set)
        const priceNorm =
          p.price === null ? 0.5 : normalizeLowerBetter(p.price, priceMin, priceMax);

        // Distance: closer is better (normalized within candidate set)
        const distanceNorm =
          p.distanceKm === null ? 0.5 : normalizeLowerBetter(p.distanceKm, distMin, distMax);

        // Weights: favor rating, then distance, then price/experience
        const score =
          0.35 * ratingNorm +
          0.25 * distanceNorm +
          0.2 * priceNorm +
          0.2 * experienceNorm;

        return { ...p, score };
      });

      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (b.reviews !== a.reviews) return b.reviews - a.reviews;
        return 0;
      });

      const total = scored.length;
      const start = (safePage - 1) * safeLimit;
      const pageIds = scored.slice(start, start + safeLimit).map((p) => p.id);

      const pageProviders = pageIds.length
        ? await prisma.serviceProvider.findMany({
            where: { id: { in: pageIds } },
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
          })
        : [];

      const byId = new Map(pageProviders.map((p) => [p.id, p]));
      const providers = pageIds.map((id) => byId.get(id)).filter(Boolean) as any[];

      return { providers, total, page: safePage, limit: safeLimit };
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
