import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/providers/unavailability → Add custom unavailable date
 * GET  /api/providers/unavailability → Get all unavailable dates
 */

export async function POST(req: NextRequest) {
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

    // 2. Must be a PROVIDER
    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can manage unavailability' },
        { status: 403 }
      );
    }

    // 3. Find the provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // 4. Parse & validate body
    const body = await req.json();
    const { date, reason } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'date is required in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Parse and validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (parsedDate < today) {
      return NextResponse.json(
        { error: 'Cannot mark past dates as unavailable' },
        { status: 400 }
      );
    }

    // 5. Check if already exists
    const existing = await prisma.unavailableDate.findFirst({
      where: {
        providerId: provider.id,
        date: {
          gte: new Date(parsedDate.toISOString().split('T')[0]),
          lt: new Date(new Date(parsedDate.toISOString().split('T')[0]).getTime() + 86400000),
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This date is already marked as unavailable' },
        { status: 409 }
      );
    }

    // 6. Create unavailable date
    const unavailableDate = await prisma.unavailableDate.create({
      data: {
        providerId: provider.id,
        date: parsedDate,
        reason: reason || null,
      },
    });

    return NextResponse.json(
      {
        message: 'Unavailable date added',
        unavailableDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unavailability POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add unavailable date' },
      { status: 500 }
    );
  }
}

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

    // 2. Find the provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // 3. Get unavailable dates
    const unavailableDates = await prisma.unavailableDate.findMany({
      where: {
        providerId: provider.id,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({ unavailableDates }, { status: 200 });
  } catch (error) {
    console.error('Unavailability GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unavailable dates' },
      { status: 500 }
    );
  }
}
