import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/providers/availability → Save weekly availability
 * GET  /api/providers/availability → Get availability for all services
 */

const getNextOccurrenceDate = (dayOfWeek: number, hour: number, minute: number) => {
  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hour, minute, 0, 0);

  const todayDow = candidate.getDay();
  let delta = (dayOfWeek - todayDow + 7) % 7;
  candidate.setDate(candidate.getDate() + delta);

  if (delta === 0 && candidate <= now) {
    candidate.setDate(candidate.getDate() + 7);
  }

  return candidate;
};

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
    const { serviceId, dayOfWeek, startTime, endTime } = body;

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

    // 5. Verify service exists and belongs to provider
    if (serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: serviceId,
          providerId: provider.id,
        },
      });

      if (!service) {
        return NextResponse.json(
          { error: 'Service not found or does not belong to you' },
          { status: 404 }
        );
      }
    } else {
      // If no serviceId provided, return error
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    // 6. Create DateTime objects using next upcoming occurrence of the day
    const occurrenceDate = getNextOccurrenceDate(dayOfWeek, startHour, startMin);
    const startDateTime = new Date(occurrenceDate);
    const endDateTime = new Date(occurrenceDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    // 7. Check for overlap with existing availability on same day
    const existing = await prisma.availability.findFirst({
      where: {
        providerId: provider.id,
        serviceId: serviceId,
        dayOfWeek: dayOfWeek,
      },
    });

    let availability;

    if (existing) {
      // Update existing
      availability = await prisma.availability.update({
        where: { id: existing.id },
        data: {
          startTime: startDateTime,
          endTime: endDateTime,
        },
      });
    } else {
      // Create new
      availability = await prisma.availability.create({
        data: {
          providerId: provider.id,
          serviceId: serviceId,
          dayOfWeek: dayOfWeek,
          startTime: startDateTime,
          endTime: endDateTime,
        },
      });
    }

    return NextResponse.json(
      {
        message: existing ? 'Availability updated' : 'Availability created',
        availability,
      },
      { status: existing ? 200 : 201 }
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

    // 3. Get availability for services
    const availability = await prisma.availability.findMany({
      where: {
        providerId: provider.id,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    const now = new Date();
    const updatedAvailability = [];

    for (const slot of availability) {
      const endTime = new Date(slot.endTime);

      if (endTime <= now) {
        const startHour = new Date(slot.startTime).getHours();
        const startMin = new Date(slot.startTime).getMinutes();
        const endHour = new Date(slot.endTime).getHours();
        const endMin = new Date(slot.endTime).getMinutes();

        const nextDate = getNextOccurrenceDate(slot.dayOfWeek, startHour, startMin);
        const nextStart = new Date(nextDate);
        const nextEnd = new Date(nextDate);
        nextEnd.setHours(endHour, endMin, 0, 0);

        const updatedSlot = await prisma.availability.update({
          where: { id: slot.id },
          data: {
            startTime: nextStart,
            endTime: nextEnd,
          },
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        updatedAvailability.push(updatedSlot);
      } else {
        updatedAvailability.push(slot);
      }
    }

    return NextResponse.json({ availability: updatedAvailability }, { status: 200 });
  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
