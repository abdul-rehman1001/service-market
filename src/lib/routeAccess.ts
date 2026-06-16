import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ActiveMode } from '@/lib/auth';
import {
  getAccessTokenClaims,
  getSessionModeFromCookie,
} from '@/lib/accessTokenRole';
import {
  ACCESS_TOKEN_COOKIE,
  PREFERRED_MODE_COOKIE,
  SESSION_MODE_COOKIE,
} from '@/lib/cookies';
import {
  emailVerificationPath,
  isEmailVerificationRoute,
  shouldBlockUnverifiedEmail,
} from '@/lib/emailVerification';
import {
  classifyRoute,
  normalizePath,
  sanitizeNextPath,
} from '@/lib/routes';

function redirectToLogin(request: NextRequest, returnPath: string): NextResponse {
  const loginUrl = new URL('/login', request.url);
  const safeNext = sanitizeNextPath(returnPath);
  if (safeNext) {
    loginUrl.searchParams.set('next', safeNext);
  }
  return NextResponse.redirect(loginUrl);
}

function redirectForActiveMode(role: ActiveMode, request: NextRequest): NextResponse {
  if (role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  if (role === 'PROVIDER') {
    return NextResponse.redirect(new URL('/provider/dashboard', request.url));
  }
  return NextResponse.redirect(new URL('/home', request.url));
}

function redirectToEmailVerification(userId: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(emailVerificationPath(userId), request.url));
}

function isAuthEntryRoute(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/register/') ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password/')
  );
}

function resolveActiveModeFromCookies(request: NextRequest): ActiveMode | null {
  const preferredMode = getSessionModeFromCookie(
    request.cookies.get(PREFERRED_MODE_COOKIE)?.value
  );
  if (preferredMode) return preferredMode;

  const sessionMode = getSessionModeFromCookie(
    request.cookies.get(SESSION_MODE_COOKIE)?.value
  );
  if (sessionMode) return sessionMode;

  return null;
}

/**
 * Returns a redirect response when access should be blocked, or null to continue.
 */
export function evaluateRouteAccess(request: NextRequest): NextResponse | null {
  const pathname = normalizePath(request.nextUrl.pathname);
  const access = classifyRoute(pathname);

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = getAccessTokenClaims(accessToken);
  const activeMode = claims?.role ?? resolveActiveModeFromCookies(request);
  const hasVerifiedSession = Boolean(claims) && !shouldBlockUnverifiedEmail(claims);

  if (shouldBlockUnverifiedEmail(claims)) {
    const mayStay =
      isEmailVerificationRoute(pathname) ||
      isAuthEntryRoute(pathname) ||
      access === 'public';

    if (!mayStay) {
      return redirectToEmailVerification(claims!.userId, request);
    }
  }

  if (access === 'public') {
    return null;
  }

  // Customer home — guests may browse; active provider/admin must use their own dashboard
  if (access === 'seeker') {
    if (hasVerifiedSession && activeMode && activeMode !== 'SEEKER') {
      return redirectForActiveMode(activeMode, request);
    }
    return null;
  }

  if (access === 'guest-only') {
    if (shouldBlockUnverifiedEmail(claims)) {
      return null;
    }
    if (hasVerifiedSession && activeMode) {
      const next = request.nextUrl.searchParams.get('next');
      const safeNext = sanitizeNextPath(next);
      if (safeNext && classifyRoute(safeNext) !== 'guest-only' && canAccessWithAuth(safeNext, activeMode)) {
        return NextResponse.redirect(new URL(safeNext, request.url));
      }
      return redirectForActiveMode(activeMode, request);
    }
    return null;
  }

  if (!claims) {
    return redirectToLogin(request, pathname);
  }

  if (shouldBlockUnverifiedEmail(claims)) {
    return redirectToEmailVerification(claims.userId, request);
  }

  if (access === 'authenticated') {
    return null;
  }

  if (access === 'provider') {
    if (activeMode === 'PROVIDER') {
      return null;
    }
    if (activeMode) {
      return redirectForActiveMode(activeMode, request);
    }
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (access === 'admin') {
    if (activeMode === 'ADMIN') {
      return null;
    }
    if (activeMode) {
      return redirectForActiveMode(activeMode, request);
    }
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return null;
}

function canAccessWithAuth(pathname: string, role: ActiveMode): boolean {
  const access = classifyRoute(pathname);
  if (access === 'public' || access === 'authenticated') return true;
  if (access === 'seeker') return role === 'SEEKER';
  if (access === 'provider') return role === 'PROVIDER';
  if (access === 'admin') return role === 'ADMIN';
  return false;
}
