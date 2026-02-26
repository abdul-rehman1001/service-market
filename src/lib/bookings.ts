import { Prisma, PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export const HOLD_DURATION_MINUTES = 10;
export const PROVIDER_RESPONSE_MINUTES = 30;

const AUTO_CANCEL_REASON = 'Auto cancelled due to no response';
const HOLD_EXPIRED_REASON = 'Hold expired';

export const generateBookingNumber = () => {
  const suffix = crypto.randomUUID().split('-')[0].toUpperCase();
  return `BK-${suffix}`;
};

type PrismaWriter = PrismaClient | Prisma.TransactionClient;

export const autoCancelExpiredBookings = async (prisma: PrismaWriter) => {
  return prisma.booking.updateMany({
    where: {
      status: 'PENDING',
      providerResponseDeadline: { lt: new Date() },
    },
    data: {
      status: 'AUTO_CANCELLED',
      cancellationReason: AUTO_CANCEL_REASON,
      cancelledBy: 'ADMIN',
    },
  });
};

export const cancelExpiredHolds = async (prisma: PrismaWriter) => {
  return prisma.booking.updateMany({
    where: {
      status: 'HOLD',
      holdExpiresAt: { lt: new Date() },
    },
    data: {
      status: 'CANCELLED',
      cancellationReason: HOLD_EXPIRED_REASON,
      cancelledBy: 'ADMIN',
    },
  });
};
