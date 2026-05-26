import { legacyImageRedirects } from '@/lib/landing-images';
import { NextResponse } from 'next/server';

/**
 * Redirects requests for removed public/images assets to Cloudinary or /file.svg.
 * Handles cached HTML, bookmarks, and Next.js image optimizer fetches in production.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const { filename } = await context.params;
  const target = legacyImageRedirects[filename];

  if (!target) {
    return new NextResponse(null, { status: 404 });
  }

  if (target.startsWith('/')) {
    return NextResponse.redirect(new URL(target, _request.url), 307);
  }

  return NextResponse.redirect(target, 307);
}
