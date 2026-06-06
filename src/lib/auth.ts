import type { NextRequest } from 'next/server';
import type { UserRole } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

export type ActiveMode = 'SEEKER' | 'PROVIDER' | 'ADMIN';

export interface JwtPayload {
  userId: string;
  role: ActiveMode;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  const decoded = verifyToken(token) as { userId?: string; role?: string } | null;
  if (!decoded?.userId || !decoded?.role) return null;

  const role = String(decoded.role).toUpperCase();
  if (role !== 'SEEKER' && role !== 'PROVIDER' && role !== 'ADMIN') {
    return null;
  }

  return {
    userId: decoded.userId,
    role: role as ActiveMode,
  };
}

export function getTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get('token')?.value;
}

export function getAuthFromRequest(req: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return parseJwtPayload(token);
}

export function resolveInitialActiveMode(params: {
  accountRole: UserRole;
  hasProviderProfile: boolean;
  preferredMode?: string | null;
}): ActiveMode {
  const { accountRole, hasProviderProfile, preferredMode } = params;

  if (accountRole === 'ADMIN') {
    return 'ADMIN';
  }

  const normalizedPreferred = String(preferredMode ?? '').toUpperCase();

  if (normalizedPreferred === 'PROVIDER' && hasProviderProfile) {
    return 'PROVIDER';
  }

  if (normalizedPreferred === 'SEEKER') {
    return 'SEEKER';
  }

  if (hasProviderProfile && accountRole === 'PROVIDER') {
    return 'PROVIDER';
  }

  return 'SEEKER';
}

export function getModeDisplayLabel(mode: string): string {
  const normalized = String(mode).toUpperCase();
  if (normalized === 'PROVIDER') return 'Provider';
  if (normalized === 'SEEKER') return 'Customer';
  if (normalized === 'ADMIN') return 'Admin';
  return mode;
}

export function canUseActiveMode(
  mode: ActiveMode,
  params: { accountRole: UserRole; hasProviderProfile: boolean }
): boolean {
  if (params.accountRole === 'ADMIN') {
    return mode === 'ADMIN';
  }

  if (mode === 'SEEKER') {
    return true;
  }

  if (mode === 'PROVIDER') {
    return params.hasProviderProfile;
  }

  return false;
}
