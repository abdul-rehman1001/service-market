import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistance } from '@/lib/geocoding';
import { categoryKeywords } from '@/lib/training-data';

/**
 * GET /api/providers/ai-search
 *
 * Search providers by AI-classified category.
 * Accepts either a `categoryId` (preferred, from classifier) or a `category` text.
 *
 * Query params:
 * - categoryId: string  (DB category ID – fastest path)
 * - category:   string  (fallback text search)
 * - page:       number  (default 1)
 * - limit:      number  (default 12, max 50)
 * - userLat:    number  (optional)
 * - userLng:    number  (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const userLat = searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : null;
    const userLng = searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : null;

    if (!categoryId && !category) {
      return NextResponse.json(
        { error: 'Either categoryId or category is required' },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------
    // Resolve category IDs
    // ------------------------------------------------------------------
    let categoryIds: string[] = [];

    if (categoryId) {
      // Direct DB ID – also include children of this category
      const children = await prisma.serviceCategory.findMany({
        where: { parentId: categoryId, isActive: true },
        select: { id: true },
      });
      categoryIds = [categoryId, ...children.map((c) => c.id)];
    } else if (category) {
      // Text-based fallback: use keyword patterns + contains search
      const keywords = categoryKeywords[category.toLowerCase()] ?? [category];

      const matched = await prisma.serviceCategory.findMany({
        where: {
          isActive: true,
          OR: keywords.map((kw) => ({
            name: { contains: kw, mode: 'insensitive' as const },
          })),
        },
        select: { id: true },
      });

      categoryIds = matched.map((c) => c.id);

      // If a parent category matched, also include its children
      if (categoryIds.length > 0) {
        const children = await prisma.serviceCategory.findMany({
          where: { parentId: { in: categoryIds }, isActive: true },
          select: { id: true },
        });
        categoryIds = [...new Set([...categoryIds, ...children.map((c) => c.id)])];
      }
    }

    if (categoryIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0, hasMore: false },
        message: 'No categories found matching the search criteria',
      });
    }

    // ------------------------------------------------------------------
    // Fetch providers with matching active services
    // ------------------------------------------------------------------
    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
        services: {
          some: {
            categoryId: { in: categoryIds },
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, profileImage: true, bio: true },
        },
        services: {
          where: { categoryId: { in: categoryIds }, isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            minPrice: true,
            maxPrice: true,
            category: { select: { id: true, name: true, parentId: true } },
          },
        },
      },
    });

    // ------------------------------------------------------------------
    // Enrich, sort, paginate
    // ------------------------------------------------------------------
    const enriched = providers.map((p) => {
      const avgRating = parseFloat(p.averageRating.toString());
      const services = p.services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        minPrice: parseFloat(s.minPrice.toString()),
        maxPrice: parseFloat(s.maxPrice.toString()),
        category: s.category,
      }));
      const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.minPrice)) : undefined;

      let distance: number | undefined;
      if (userLat !== null && userLng !== null) {
        distance = calculateDistance(
          userLat,
          userLng,
          parseFloat(p.latitude.toString()),
          parseFloat(p.longitude.toString())
        );
      }

      return {
        id: p.id,
        userId: p.userId,
        name: p.businessName || `${p.user.firstName} ${p.user.lastName}`,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        profileImage: p.user.profileImage,
        bio: p.user.bio,
        rating: avgRating,
        totalReviews: p.totalReviews,
        totalJobsCompleted: p.totalJobsCompleted,
        yearsOfExperience: p.yearsOfExperience,
        baseAddress: p.baseAddress,
        verificationStatus: p.verificationStatus,
        distance,
        minPrice,
        services,
      };
    });

    // Multi-level sort: rating DESC → distance ASC → price ASC → experience DESC
    enriched.sort((a, b) => {
      if (a.rating !== b.rating) return b.rating - a.rating;
      if (a.distance != null && b.distance != null && a.distance !== b.distance)
        return a.distance - b.distance;
      if (a.minPrice != null && b.minPrice != null && a.minPrice !== b.minPrice)
        return a.minPrice - b.minPrice;
      return b.yearsOfExperience - a.yearsOfExperience;
    });

    const total = enriched.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginated = enriched.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
      filters: { categoryId, category },
    });
  } catch (error: any) {
    console.error('Error in AI search providers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search providers' },
      { status: 500 }
    );
  }
}
