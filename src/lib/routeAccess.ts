import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ActiveMode } from '@/lib/auth';
import { getAccessTokenRole, getSessionModeFromCookie } from '@/lib/accessTokenRole';
import {
  ACCESS_TOKEN_COOKIE,
  PREFERRED_MODE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  SESSION_MODE_COOKIE,
} from '@/lib/cookies';
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

function resolveActiveModeFromRequest(request: NextRequest): ActiveMode | null {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const roleFromAccess = getAccessTokenRole(accessToken);
  if (roleFromAccess) return roleFromAccess;

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

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const activeMode = resolveActiveModeFromRequest(request);
  const hasSession = Boolean(activeMode) || Boolean(refreshToken);

  if (access === 'public') {
    return null;
  }

  // Customer home — guests may browse; active provider/admin must use their own dashboard
  if (access === 'seeker') {
    if (activeMode && activeMode !== 'SEEKER') {
      return redirectForActiveMode(activeMode, request);
    }
    return null;
  }

  if (access === 'guest-only') {
    if (activeMode) {
      const next = request.nextUrl.searchParams.get('next');
      const safeNext = sanitizeNextPath(next);
      if (safeNext && classifyRoute(safeNext) !== 'guest-only' && canAccessWithAuth(safeNext, activeMode)) {
        return NextResponse.redirect(new URL(safeNext, request.url));
      }
      return redirectForActiveMode(activeMode, request);
    }
    return null;
  }

  if (!hasSession) {
    return redirectToLogin(request, pathname);
  }

  if (access === 'authenticated') {
    return null;
  }

  if (access === 'provider') {
    if (activeMode === 'PROVIDER') {
      return null;
    }
    if (!hasSession) {
      return redirectToLogin(request, pathname);
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
    if (!hasSession) {
      return redirectToLogin(request, pathname);
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
