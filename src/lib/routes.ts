import type { ActiveMode } from '@/lib/auth';

/** Provider app routes — not public /provider/[id] profiles */
const PROVIDER_APP_ROUTES = new Set([
  'dashboard',
  'documents',
  'verify-identity',
  'portfolio',
]);

/** Customer-facing pages — guests and SEEKER mode only (not active provider/admin) */
const SEEKER_MODE_PATHS = new Set(['/home']);

const AUTH_REQUIRED_PATHS = new Set([
  '/profile',
  '/bookings',
  '/messages',
  '/notifications',
  '/become-provider',
]);

const GUEST_ONLY_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-registration',
  '/verify-email-registration',
] as const;

export type RouteAccessLevel =
  | 'public'
  | 'seeker'
  | 'authenticated'
  | 'provider'
  | 'admin'
  | 'guest-only';

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function classifyRoute(pathname: string): RouteAccessLevel {
  const path = normalizePath(pathname);

  if (path.startsWith('/api/') || path.startsWith('/_next/')) {
    return 'public';
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    return 'admin';
  }

  if (path.startsWith('/provider/')) {
    const segment = path.split('/')[2];
    if (segment && PROVIDER_APP_ROUTES.has(segment)) {
      return 'provider';
    }
    return 'public';
  }

  if (SEEKER_MODE_PATHS.has(path)) {
    return 'seeker';
  }

  if (AUTH_REQUIRED_PATHS.has(path)) {
    return 'authenticated';
  }

  if (GUEST_ONLY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return 'guest-only';
  }

  return 'public';
}

export function sanitizeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

export function defaultPathForMode(role: string): string {
  const mode = role.toUpperCase();
  if (mode === 'ADMIN') return '/admin';
  if (mode === 'PROVIDER') return '/provider/dashboard';
  return '/home';
}

export function canAccessRouteWithMode(pathname: string, role: string): boolean {
  const access = classifyRoute(pathname);
  const mode = role.toUpperCase() as ActiveMode;

  if (access === 'public' || access === 'guest-only') return true;
  if (access === 'seeker') return mode === 'SEEKER';
  if (access === 'authenticated') return true;
  if (access === 'provider') return mode === 'PROVIDER';
  if (access === 'admin') return mode === 'ADMIN';
  return true;
}

export function resolvePostLoginPath(role: string, next: string | null | undefined): string {
  const safeNext = sanitizeNextPath(next);
  if (safeNext && canAccessRouteWithMode(safeNext, role)) {
    return safeNext;
  }
  return defaultPathForMode(role);
}
