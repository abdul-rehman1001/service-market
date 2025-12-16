import { NextResponse } from 'next/server';

export function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, 
  });
}

export function removeTokenCookie(res: NextResponse) {
  res.cookies.set('token', '', { maxAge: 0, path: '/' });
}
