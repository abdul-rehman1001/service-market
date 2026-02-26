import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/providers/availability → Save weekly availability
 * GET  /api/providers/availability → Get availability
 */

const timeStringToDate = (time: string) => new Date(`1970-01-01T${time}:00Z`);

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
        { error: 'Only providers can manage availability' },
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
    const { dayOfWeek, startTime, endTime } = body;

    // Validate dayOfWeek
    if (dayOfWeek === undefined || typeof dayOfWeek !== 'number') {
      return NextResponse.json(
        { error: 'dayOfWeek is required and must be a number (0-6)' },
        { status: 400 }
      );
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      );
    }

    // Validate times
    if (!startTime || typeof startTime !== 'string') {
      return NextResponse.json(
        { error: 'startTime is required in HH:mm format' },
        { status: 400 }
      );
    }

    if (!endTime || typeof endTime !== 'string') {
      return NextResponse.json(
        { error: 'endTime is required in HH:mm format' },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Times must be in HH:mm format (e.g., 09:00)' },
        { status: 400 }
      );
    }

    // Parse times and validate endTime > startTime
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // 5. Create time-only Date objects
    const startDateTime = timeStringToDate(startTime);
    const endDateTime = timeStringToDate(endTime);

    // 7. Check for overlap with existing availability on same day
    const existingSlots = await prisma.availability.findMany({
      where: {
        providerId: provider.id,
        dayOfWeek: dayOfWeek,
      },
    });

    const hasOverlap = existingSlots.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const slotStartMinutes = slotStart.getUTCHours() * 60 + slotStart.getUTCMinutes();
      const slotEndMinutes = slotEnd.getUTCHours() * 60 + slotEnd.getUTCMinutes();

      return startMinutes < slotEndMinutes && endMinutes > slotStartMinutes;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Time slot overlaps with existing availability' },
        { status: 400 }
      );
    }

    // 8. Create new slot
    const availability = await prisma.availability.create({
      data: {
        providerId: provider.id,
        dayOfWeek: dayOfWeek,
        startTime: startDateTime,
        endTime: endDateTime,
      },
    });

    return NextResponse.json(
      {
        message: 'Availability created',
        availability,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save availability' },
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

    // 3. Get availability for provider
    const availability = await prisma.availability.findMany({
      where: {
        providerId: provider.id,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
