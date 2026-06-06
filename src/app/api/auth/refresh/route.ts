import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_TOKEN_COOKIE } from '@/lib/cookies';
import {
  applyAuthSessionCookies,
  clearAuthSessionCookies,
  rotateAuthSession,
} from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      const res = NextResponse.json({ error: 'No refresh token' }, { status: 401 });
      clearAuthSessionCookies(res);
      return res;
    }

    const session = await rotateAuthSession(refreshToken);

    if (!session) {
      const res = NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
      clearAuthSessionCookies(res);
      return res;
    }

    const res = NextResponse.json({
      ok: true,
      rememberMe: session.rememberMe,
    });

    applyAuthSessionCookies(res, session);
    return res;
  } catch (error) {
    console.error('Refresh token error:', error);
    const res = NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
    clearAuthSessionCookies(res);
    return res;
  }
}
