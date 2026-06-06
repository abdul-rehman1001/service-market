import crypto from 'crypto';
import type { ActiveMode } from '@/lib/auth';
import prisma from '@/lib/prisma';

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface RefreshTokenSession {
  userId: string;
  activeMode: ActiveMode;
}

/**
 * Reads active mode from the refresh-token DB row (authoritative server-side source).
 */
export async function getActiveModeFromRefreshToken(
  refreshTokenPlain: string
): Promise<RefreshTokenSession | null> {
  try {
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(refreshTokenPlain) },
      select: { userId: true, activeMode: true, revokedAt: true, expiresAt: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      return null;
    }

    const mode = String(stored.activeMode).toUpperCase();
    if (mode !== 'SEEKER' && mode !== 'PROVIDER' && mode !== 'ADMIN') {
      return null;
    }

    return {
      userId: stored.userId,
      activeMode: mode as ActiveMode,
    };
  } catch {
    return null;
  }
}
