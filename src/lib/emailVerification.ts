import { normalizePath } from '@/lib/routes';

export function emailVerificationPath(userId: string): string {
  return `/verify-email-registration?userId=${encodeURIComponent(userId)}`;
}

/** Routes an unverified user may visit while completing email verification. */
export function isEmailVerificationRoute(pathname: string): boolean {
  const path = normalizePath(pathname);

  return (
    path === '/verify-email-registration' ||
    path.startsWith('/verify-email-registration/') ||
    path === '/verify-email' ||
    path.startsWith('/verify-email/')
  );
}

export type AccessTokenClaims = {
  userId: string;
  role: string;
  emailVerified?: boolean;
};

export function shouldBlockUnverifiedEmail(
  claims: Pick<AccessTokenClaims, 'userId' | 'role' | 'emailVerified'> | null
): boolean {
  if (!claims?.userId) return false;
  if (String(claims.role).toUpperCase() === 'ADMIN') return false;
  return claims.emailVerified === false;
}
