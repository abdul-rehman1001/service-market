import { NextRequest, NextResponse } from 'next/server';

/**
 * This endpoint is no longer needed - images are served directly from Cloudinary
 * Kept for backward compatibility
 */
export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Images are served directly from Cloudinary.' },
    { status: 400 }
  );
}
