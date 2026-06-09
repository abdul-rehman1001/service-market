import prisma from '@/lib/prisma';

const ACTIVE_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'] as const;

export class ServiceNotFoundError extends Error {
  constructor() {
    super('Service not found');
    this.name = 'ServiceNotFoundError';
  }
}

export class ActiveBookingsError extends Error {
  count: number;

  constructor(count: number) {
    super(`This service has ${count} active booking(s). Please complete or cancel them first.`);
    this.name = 'ActiveBookingsError';
    this.count = count;
  }
}

export type ServiceDeletionResult =
  | { action: 'deleted' }
  | { action: 'deactivated'; bookingCount: number };

/**
 * Permanently deletes a service only when it has no bookings.
 * If booking history exists (completed/cancelled), deactivates instead to preserve records.
 */
export async function deleteOrDeactivateService(serviceId: string): Promise<ServiceDeletionResult> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!service) {
    throw new ServiceNotFoundError();
  }

  const activeBookings = await prisma.booking.count({
    where: {
      serviceId,
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
    },
  });

  if (activeBookings > 0) {
    throw new ActiveBookingsError(activeBookings);
  }

  if (service._count.bookings > 0) {
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });
    return { action: 'deactivated', bookingCount: service._count.bookings };
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  return { action: 'deleted' };
}
