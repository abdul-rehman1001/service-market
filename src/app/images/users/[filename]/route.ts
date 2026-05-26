import { legacyImageRedirects } from '@/lib/landing-images';
import { NextResponse } from 'next/server';

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
