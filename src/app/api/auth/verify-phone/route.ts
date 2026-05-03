import { NextResponse } from 'next/server';

// Phone OTP verification has been removed from the product.
// Keep this route as a safe stub so older clients/links don't crash.
export async function POST() {
  return NextResponse.json(
    { error: 'Phone verification is no longer supported.' },
    { status: 410 }
  );
}