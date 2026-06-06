import { NextRequest, NextResponse } from 'next/server';
import { REFRESH_TOKEN_COOKIE } from '@/lib/cookies';
import { clearAuthSessionCookies, revokeRefreshToken } from '@/lib/session';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  const res = NextResponse.json({ message: 'Logged out' });
  clearAuthSessionCookies(res);
  return res;
}
