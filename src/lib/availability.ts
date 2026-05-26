export type AvailabilityRecord = {
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
};

export type BookingRange = {
  scheduledStart: Date;
  scheduledEnd: Date;
};

const pad = (value: number) => value.toString().padStart(2, '0');

export const timeValueToHHmm = (value: Date) => {
  const hours = value.getUTCHours();
  const minutes = value.getUTCMinutes();
  return `${pad(hours)}:${pad(minutes)}`;
};

const dateToHHmm = (value: Date) => {
  const hours = value.getHours();
  const minutes = value.getMinutes();
  return `${pad(hours)}:${pad(minutes)}`;
};

export const combineDateAndTime = (date: string, time: string) => {
  return new Date(`${date}T${time}:00`);
};

/** Parse "HH:mm" or "H:mm" to minutes from midnight. */
export const timeToMinutes = (time: string): number => {
  const normalized = normalizeTimeHHmm(time);
  if (!normalized) {
    return NaN;
  }
  const [hours, minutes] = normalized.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Normalize to "HH:mm" for comparisons and API payloads. */
export const normalizeTimeHHmm = (time: string): string | null => {
  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return `${pad(hours)}:${pad(minutes)}`;
};

/** True when `time` falls inside [rangeStart, rangeEnd) on the same day. */
export const isTimeWithinRange = (
  time: string,
  rangeStart: string,
  rangeEnd: string
): boolean => {
  const t = timeToMinutes(time);
  const start = timeToMinutes(rangeStart);
  const end = timeToMinutes(rangeEnd);
  if ([t, start, end].some(Number.isNaN)) {
    return false;
  }
  return t >= start && t < end;
};

/**
 * True when a booking can start at `time` inside [rangeStart, rangeEnd)
 * and run for `durationMinutes` without exceeding the window end.
 */
export const canStartServiceInRange = (
  time: string,
  rangeStart: string,
  rangeEnd: string,
  durationMinutes: number
): boolean => {
  const t = timeToMinutes(time);
  const start = timeToMinutes(rangeStart);
  const end = timeToMinutes(rangeEnd);
  if ([t, start, end].some(Number.isNaN)) {
    return false;
  }
  return t >= start && t + durationMinutes <= end;
};

export const isOverlappingRange = (
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) => startA < endB && endA > startB;

export const generateSlotsForDate = ({
  availability,
  date,
  durationMinutes,
  bookings,
  now = new Date(),
}: {
  availability: AvailabilityRecord[];
  date: string;
  durationMinutes: number;
  bookings: BookingRange[];
  now?: Date;
}) => {
  const durationMs = durationMinutes * 60 * 1000;
  const slots: { startTime: string; endTime: string; start: string; end: string }[] = [];

  availability.forEach((slot) => {
    const slotStartTime = combineDateAndTime(date, timeValueToHHmm(slot.startTime));
    const slotEndTime = combineDateAndTime(date, timeValueToHHmm(slot.endTime));

    for (
      let cursor = new Date(slotStartTime);
      cursor.getTime() + durationMs <= slotEndTime.getTime();
      cursor = new Date(cursor.getTime() + durationMs)
    ) {
      const nextEnd = new Date(cursor.getTime() + durationMs);

      if (nextEnd <= now) {
        continue;
      }

      const overlaps = bookings.some((booking) =>
        isOverlappingRange(cursor, nextEnd, booking.scheduledStart, booking.scheduledEnd)
      );

      if (!overlaps) {
        slots.push({
          startTime: dateToHHmm(cursor),
          endTime: dateToHHmm(nextEnd),
          start: cursor.toISOString(),
          end: nextEnd.toISOString(),
        });
      }
    }
  });

  return slots;
};
