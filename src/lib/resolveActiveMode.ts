import { cookies } from 'next/headers';
import type { ActiveMode } from '@/lib/auth';
import { getAccessTokenRole, getSessionModeFromCookie } from '@/lib/accessTokenRole';
import {
  ACCESS_TOKEN_COOKIE,
  PREFERRED_MODE_COOKIE,
  SESSION_MODE_COOKIE,
} from '@/lib/cookies';

/**
 * Resolves the user's active mode on the server from auth cookies.
 */
export async function resolveActiveModeFromCookies(): Promise<ActiveMode | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const roleFromAccess = getAccessTokenRole(accessToken);
  if (roleFromAccess) return roleFromAccess;

  const sessionMode = getSessionModeFromCookie(
    cookieStore.get(SESSION_MODE_COOKIE)?.value
  );
  if (sessionMode) return sessionMode;

  const preferredMode = getSessionModeFromCookie(
    cookieStore.get(PREFERRED_MODE_COOKIE)?.value
  );
  if (preferredMode) return preferredMode;

  return null;
}

export function redirectPathForMode(mode: ActiveMode): string {
  if (mode === 'ADMIN') return '/admin';
  if (mode === 'PROVIDER') return '/provider/dashboard';
  return '/home';
}
