import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/services
 * List all services with search, filter, and pagination (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate
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

    // 2. Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const categoryId = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // active | inactive
    const sortBy = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // 3. Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        {
          provider: {
            user: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          provider: {
            businessName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // 4. Allowed sort fields
    const allowedSorts: Record<string, any> = {
      createdAt: { createdAt: order === 'asc' ? 'asc' : 'desc' },
      name: { name: order === 'asc' ? 'asc' : 'desc' },
      minPrice: { minPrice: order === 'asc' ? 'asc' : 'desc' },
      updatedAt: { updatedAt: order === 'asc' ? 'asc' : 'desc' },
    };

    const orderBy = allowedSorts[sortBy] || allowedSorts.createdAt;

    // 5. Fetch services + total count
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          provider: {
            select: {
              id: true,
              businessName: true,
              verificationStatus: true,
              averageRating: true,
              totalReviews: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return NextResponse.json(
      {
        services,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching admin services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error.message },
      { status: 500 }
    );
  }
}
