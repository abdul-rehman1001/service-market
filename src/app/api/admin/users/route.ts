import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/users
 * List all users with search, filter, and pagination (Admin only)
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const role = searchParams.get('role') || '';           // SEEKER | PROVIDER
    const status = searchParams.get('status') || '';       // ACTIVE | SUSPENDED | UNVERIFIED
    const verification = searchParams.get('verification') || ''; // PENDING | APPROVED | REJECTED
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Exclude deleted users
    where.status = { not: 'DELETED' };

    // Search across name, email, phone
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by role
    if (role && ['SEEKER', 'PROVIDER'].includes(role.toUpperCase())) {
      where.role = role.toUpperCase();
    }

    // Filter by status (override the not-DELETED default)
    if (status && ['ACTIVE', 'SUSPENDED', 'UNVERIFIED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    // Filter by provider verification status
    if (verification && ['PENDING', 'APPROVED', 'REJECTED'].includes(verification.toUpperCase())) {
      where.providerProfile = {
        verificationStatus: verification.toUpperCase(),
      };
    }

    // Filter by registration date range
    if (dateFrom) {
      where.createdAt = { ...where.createdAt, gte: new Date(dateFrom) };
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    // Query users + total count in parallel
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          profileImage: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          providerProfile: {
            select: {
              verificationStatus: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
