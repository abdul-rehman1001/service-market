import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/cookies';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' });
  removeTokenCookie(res);
  return res;
}
