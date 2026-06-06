import { NextResponse } from 'next/server';
import type { ActiveMode } from '@/lib/auth';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const ACCESS_TOKEN_COOKIE = 'token';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

export function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, baseCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
}

export function setRefreshTokenCookie(
  res: NextResponse,
  token: string,
  rememberMe: boolean
) {
  const shortDays = Number(process.env.REFRESH_TOKEN_SHORT_DAYS || 1);
  const longDays = Number(process.env.REFRESH_TOKEN_LONG_DAYS || 30);
  const maxAge = (rememberMe ? longDays : shortDays) * 24 * 60 * 60;

  res.cookies.set(REFRESH_TOKEN_COOKIE, token, baseCookieOptions(maxAge));
}

/** @deprecated Use setAccessTokenCookie — kept for backward compatibility */
export function setTokenCookie(res: NextResponse, token: string) {
  setAccessTokenCookie(res, token);
}

export function setPreferredModeCookie(res: NextResponse, mode: ActiveMode) {
  if (mode === 'ADMIN') return;

  res.cookies.set('preferredMode', mode, {
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
  res.cookies.set(REFRESH_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
}

/** @deprecated Use clearAuthCookies */
export function removeTokenCookie(res: NextResponse) {
  clearAuthCookies(res);
}
