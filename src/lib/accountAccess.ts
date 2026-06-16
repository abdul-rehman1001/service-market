import type { UserStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

export const SUSPENDED_ACCOUNT_MESSAGE =
  'Your account is suspended. Please contact the Servizo team for further details.';

export function isBlockedAccountStatus(status: UserStatus): boolean {
  return status === 'SUSPENDED' || status === 'DELETED';
}

export async function assertAccountCanAct(
  userId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  });

  if (!user) {
    return { ok: false, message: 'User not found' };
  }

  if (isBlockedAccountStatus(user.status)) {
    return { ok: false, message: SUSPENDED_ACCOUNT_MESSAGE };
  }

  return { ok: true };
}
