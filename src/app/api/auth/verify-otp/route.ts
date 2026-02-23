import { NextResponse } from 'next/server';

// This endpoint is deprecated and should not be used.
// OTP verification is handled through Firebase Authentication
// and the /api/auth/verify-phone endpoint.
export async function POST(req: Request) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use Firebase OTP verification instead.' },
    { status: 410 } // 410 Gone
  );
}
