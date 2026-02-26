import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import {
  HOLD_DURATION_MINUTES,
  cancelExpiredHolds,
  generateBookingNumber,
} from '@/lib/bookings';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'SEEKER') {
      return NextResponse.json(
        { error: 'Only seekers can create bookings' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { serviceId, scheduledDate, startTime, endTime, location, problemDescription } = body;

    if (!serviceId || typeof serviceId !== 'string') {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    if (!scheduledDate || typeof scheduledDate !== 'string') {
      return NextResponse.json(
        { error: 'scheduledDate is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(scheduledDate)) {
      return NextResponse.json(
        { error: 'scheduledDate must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    if (!startTime || typeof startTime !== 'string') {
      return NextResponse.json(
        { error: 'startTime is required (HH:mm)' },
        { status: 400 }
      );
    }

    if (!endTime || typeof endTime !== 'string') {
      return NextResponse.json(
        { error: 'endTime is required (HH:mm)' },
        { status: 400 }
      );
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'startTime and endTime must be in HH:mm format' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || !location.trim()) {
      return NextResponse.json({ error: 'location is required' }, { status: 400 });
    }

    if (!problemDescription || typeof problemDescription !== 'string' || !problemDescription.trim()) {
      return NextResponse.json({ error: 'problemDescription is required' }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, isActive: true },
      select: {
        id: true,
        providerId: true,
        defaultDurationMinutes: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const scheduledStart = new Date(`${scheduledDate}T${startTime}:00`);
    const scheduledEnd = new Date(`${scheduledDate}T${endTime}:00`);

    if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(scheduledEnd.getTime())) {
      return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
    }

    if (scheduledEnd <= scheduledStart) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    const now = new Date();
    if (scheduledStart <= now) {
      return NextResponse.json({ error: 'Selected time must be in the future' }, { status: 400 });
    }

    const durationMinutes = Math.round(
      (scheduledEnd.getTime() - scheduledStart.getTime()) / 60000
    );

    if (durationMinutes !== service.defaultDurationMinutes) {
      return NextResponse.json(
        { error: 'Selected slot does not match service duration' },
        { status: 400 }
      );
    }

    const dayOfWeek = scheduledStart.getDay();

    const availability = await prisma.availability.findMany({
      where: {
        providerId: service.providerId,
        dayOfWeek,
      },
    });

    if (availability.length === 0) {
      return NextResponse.json(
        { error: 'Provider is unavailable on the selected day' },
        { status: 409 }
      );
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    const withinAvailability = availability.some((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      const slotStartMinutes = slotStart.getUTCHours() * 60 + slotStart.getUTCMinutes();
      const slotEndMinutes = slotEnd.getUTCHours() * 60 + slotEnd.getUTCMinutes();

      return startMinutes >= slotStartMinutes && endMinutes <= slotEndMinutes;
    });

    if (!withinAvailability) {
      return NextResponse.json(
        { error: 'Selected time is outside provider availability' },
        { status: 409 }
      );
    }

    const dayStart = new Date(`${scheduledDate}T00:00:00`);
    const dayEnd = new Date(`${scheduledDate}T23:59:59`);

    const unavailable = await prisma.unavailableDate.findFirst({
      where: {
        providerId: service.providerId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (unavailable) {
      return NextResponse.json(
        { error: 'Provider is unavailable on the selected date' },
        { status: 409 }
      );
    }

    const holdExpiresAt = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60000);

    const booking = await prisma.$transaction(async (tx) => {
      await cancelExpiredHolds(tx);

      const overlap = await tx.booking.findFirst({
        where: {
          providerId: service.providerId,
          AND: [
            {
              OR: [
                { status: { in: ['CONFIRMED', 'PENDING'] } },
                { status: 'HOLD', holdExpiresAt: { gt: now } },
              ],
            },
            { scheduledStart: { lt: scheduledEnd } },
            { scheduledEnd: { gt: scheduledStart } },
          ],
        },
      });

      if (overlap) {
        throw new ApiError('Selected slot overlaps with an existing booking', 409);
      }

      return tx.booking.create({
        data: {
          bookingNumber: generateBookingNumber(),
          serviceId: service.id,
          seekerId: decoded.userId,
          providerId: service.providerId,
          status: 'HOLD',
          holdExpiresAt,
          providerResponseDeadline: null,
          scheduledStart,
          scheduledEnd,
          location: location.trim(),
          problemDescription: problemDescription.trim(),
          responseDeadline: holdExpiresAt,
        },
        include: {
          service: { select: { name: true } },
          provider: { select: { id: true } },
        },
      });
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Booking HOLD error:', error);
    return NextResponse.json(
      { error: 'Failed to reserve booking slot' },
      { status: 500 }
    );
  }
}
