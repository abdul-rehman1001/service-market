import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSlotsForDate } from '@/lib/availability';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: 'serviceId and date are required' },
        { status: 400 }
      );
    }

    const provider =
      (await prisma.serviceProvider.findFirst({ where: { userId: id } })) ||
      (await prisma.serviceProvider.findUnique({ where: { id } }));

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId: provider.id, isActive: true },
      select: { id: true, defaultDurationMinutes: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const dateValue = new Date(`${date}T00:00:00`);
    if (Number.isNaN(dateValue.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const dayOfWeek = dateValue.getDay();

    const availability = await prisma.availability.findMany({
      where: { providerId: provider.id, dayOfWeek },
    });

    if (availability.length === 0) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const unavailable = await prisma.unavailableDate.findFirst({
      where: {
        providerId: provider.id,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (unavailable) {
      return NextResponse.json({ slots: [] }, { status: 200 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        providerId: provider.id,
        scheduledStart: { lt: dayEnd },
        scheduledEnd: { gt: dayStart },
        OR: [
          { status: { in: ['CONFIRMED', 'PENDING'] } },
          { status: 'HOLD', holdExpiresAt: { gt: new Date() } },
        ],
      },
      select: { scheduledStart: true, scheduledEnd: true },
    });

    const slots = generateSlotsForDate({
      availability,
      date,
      durationMinutes: service.defaultDurationMinutes,
      bookings,
      now: new Date(),
    });

    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error('Provider slots GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability slots' },
      { status: 500 }
    );
  }
}
