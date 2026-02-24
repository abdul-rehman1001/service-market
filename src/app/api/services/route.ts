import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/services → Public listing of all active services
 * Supports query params: ?category=id&search=term&minPrice=0&maxPrice=1000&page=1&limit=10
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Query parameters
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build where clause — only active services from available & verified providers
    const where: any = {
      isActive: true,
      provider: {
        isAvailable: true,
        verificationStatus: 'APPROVED',
      },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice) {
      where.minPrice = { ...(where.minPrice || {}), gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.maxPrice = { ...(where.maxPrice || {}), lte: parseFloat(maxPrice) };
    }

    // Validate pagination
    const skip = (Math.max(page, 1) - 1) * Math.max(limit, 1);
    const take = Math.min(Math.max(limit, 1), 50); // cap at 50

    // Allowed sort fields
    const allowedSorts: Record<string, any> = {
      createdAt: { createdAt: order === 'asc' ? 'asc' : 'desc' },
      name: { name: order === 'asc' ? 'asc' : 'desc' },
      minPrice: { minPrice: order === 'asc' ? 'asc' : 'desc' },
    };

    const orderBy = allowedSorts[sortBy] || allowedSorts.createdAt;

    // Fetch services + total count in parallel
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          provider: {
            select: {
              id: true,
              businessName: true,
              averageRating: true,
              totalReviews: true,
              totalJobsCompleted: true,
              isAvailable: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json(
      {
        services,
        pagination: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error.message },
      { status: 500 }
    );
  }
}
