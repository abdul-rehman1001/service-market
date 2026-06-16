import type { ActiveMode } from '@/lib/auth';

function decodeJwtPayloadUnsafe(token: string): {
  userId?: string;
  role?: string;
  emailVerified?: boolean;
  exp?: number;
} | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;

    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(segment, 'base64url').toString('utf8')
        : atob(
            segment.replace(/-/g, '+').replace(/_/g, '/') +
              '='.repeat((4 - (segment.length % 4)) % 4)
          );

    return JSON.parse(json) as {
      userId?: string;
      role?: string;
      emailVerified?: boolean;
      exp?: number;
    };
  } catch {
    return null;
  }
}

function normalizeActiveMode(value: string | undefined): ActiveMode | null {
  if (!value) return null;
  const role = String(value).toUpperCase();
  if (role === 'SEEKER' || role === 'PROVIDER' || role === 'ADMIN') {
    return role as ActiveMode;
  }
  return null;
}

/**
 * Reads active mode from the access token for routing only (Edge/proxy safe).
 */
export function getAccessTokenRole(token: string | undefined): ActiveMode | null {
  return getAccessTokenClaims(token)?.role ?? null;
}

/**
 * Edge-safe JWT decode for routing (signature verified on API routes).
 */
export function getAccessTokenClaims(
  token: string | undefined
): { userId: string; role: ActiveMode; emailVerified?: boolean } | null {
  if (!token) return null;

  const decoded = decodeJwtPayloadUnsafe(token);
  if (!decoded?.userId || !decoded?.role) return null;

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return null;
  }

  const role = normalizeActiveMode(decoded.role);
  if (!role) return null;

  return {
    userId: decoded.userId,
    role,
    emailVerified: decoded.emailVerified,
  };
}

export function getSessionModeFromCookie(
  value: string | undefined
): ActiveMode | null {
  return normalizeActiveMode(value);
}
