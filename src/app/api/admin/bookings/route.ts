import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/bookings
 * List all bookings with search, filter, and pagination (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search by booking number, seeker name, or provider name
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { seeker: { firstName: { contains: search, mode: 'insensitive' } } },
        { seeker: { lastName: { contains: search, mode: 'insensitive' } } },
        {
          provider: {
            user: { firstName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          provider: {
            user: { lastName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          provider: {
            businessName: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Filter by status
    const validStatuses = [
      'HOLD', 'PENDING', 'CONFIRMED', 'EN_ROUTE',
      'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'AUTO_CANCELLED',
    ];
    if (status && validStatuses.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Filter by category
    if (categoryId) {
      where.service = { categoryId };
    }

    // Filter by date range (scheduledStart)
    if (dateFrom) {
      where.scheduledStart = { ...where.scheduledStart, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.scheduledStart = { ...where.scheduledStart, lte: endDate };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          scheduledStart: true,
          scheduledEnd: true,
          location: true,
          cancelledBy: true,
          createdAt: true,
          service: {
            select: {
              id: true,
              name: true,
              category: {
                select: { id: true, name: true },
              },
            },
          },
          seeker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          provider: {
            select: {
              id: true,
              businessName: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    );
  }
}
