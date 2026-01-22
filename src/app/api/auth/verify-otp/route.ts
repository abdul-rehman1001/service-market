import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { otp } = await req.json();

  if (otp !== '123456') {
    return NextResponse.json(
      { error: 'Invalid OTP' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    role: 'seeker', // or provider
  });
}
