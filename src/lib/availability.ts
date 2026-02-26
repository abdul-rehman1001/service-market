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

const timeValueToHHmm = (value: Date) => {
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
