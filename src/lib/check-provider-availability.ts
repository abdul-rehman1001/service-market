import prisma from '@/lib/prisma';
import {
  combineDateAndTime,
  generateSlotsForDate,
  isOverlappingRange,
  isTimeWithinRange,
  canStartServiceInRange,
  normalizeTimeHHmm,
  timeValueToHHmm,
} from '@/lib/availability';

/**
 * Returns true when the provider can serve at `time` on `date`:
 * the time must fall inside a bookable slot or weekly window, and
 * a booking starting at that time must not overlap existing bookings.
 */
export async function isProviderAvailableAt(
  providerId: string,
  serviceId: string,
  date: string,
  time: string
): Promise<boolean> {
  const dateValue = new Date(`${date}T00:00:00`);
  if (Number.isNaN(dateValue.getTime())) {
    return false;
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId, isActive: true },
    select: { defaultDurationMinutes: true },
  });

  if (!service) {
    return false;
  }

  const dayOfWeek = dateValue.getDay();

  const availability = await prisma.availability.findMany({
    where: { providerId, dayOfWeek },
  });

  if (availability.length === 0) {
    return false;
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const unavailable = await prisma.unavailableDate.findFirst({
    where: {
      providerId,
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (unavailable) {
    return false;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      providerId,
      scheduledStart: { lt: dayEnd },
      scheduledEnd: { gt: dayStart },
      OR: [
        { status: { in: ['CONFIRMED', 'PENDING'] } },
        { status: 'HOLD', holdExpiresAt: { gt: new Date() } },
      ],
    },
    select: { scheduledStart: true, scheduledEnd: true },
  });

  const normalizedTime = normalizeTimeHHmm(time);
  if (!normalizedTime) {
    return false;
  }

  const slots = generateSlotsForDate({
    availability,
    date,
    durationMinutes: service.defaultDurationMinutes,
    bookings,
    now: new Date(),
  });

  const proposedStart = combineDateAndTime(date, normalizedTime);
  const proposedEnd = new Date(
    proposedStart.getTime() + service.defaultDurationMinutes * 60 * 1000
  );

  const hasBookingConflict = bookings.some((booking) =>
    isOverlappingRange(
      proposedStart,
      proposedEnd,
      booking.scheduledStart,
      booking.scheduledEnd
    )
  );

  if (hasBookingConflict) {
    return false;
  }

  // 1) Selected time lies inside a generated bookable slot (e.g. 09:10 in 09:00–10:30).
  const insideGeneratedSlot = slots.some((slot) =>
    isTimeWithinRange(normalizedTime, slot.startTime, slot.endTime)
  );

  if (insideGeneratedSlot) {
    return true;
  }

  // 2) Selected time is a valid start within a weekly availability window.
  const canStartInWeeklyWindow = availability.some((window) => {
    const windowStart = timeValueToHHmm(window.startTime);
    const windowEnd = timeValueToHHmm(window.endTime);
    return canStartServiceInRange(
      normalizedTime,
      windowStart,
      windowEnd,
      service.defaultDurationMinutes
    );
  });

  return canStartInWeeklyWindow;
}

export type AvailabilityCheckItem = {
  providerId: string;
  serviceId: string;
};

export async function filterAvailableProviderIds(
  items: AvailabilityCheckItem[],
  date: string,
  time: string
): Promise<string[]> {
  if (!items.length) {
    return [];
  }

  const results = await Promise.all(
    items.map(async (item) => {
      const available = await isProviderAvailableAt(
        item.providerId,
        item.serviceId,
        date,
        time
      );
      return available ? item.providerId : null;
    })
  );

  return results.filter((id): id is string => Boolean(id));
}
