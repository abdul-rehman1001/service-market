import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { evaluateRouteAccess } from '@/lib/routeAccess';

/**
 * Reject stale or probe Server Action requests without a valid deployment id.
 * Reduces log noise from bots and clients on an old build after deploy.
 */
export function proxy(request: NextRequest) {
  const actionId = request.headers.get('next-action');

  if (actionId) {
    const isProbe =
      actionId === 'x' ||
      actionId === 'y' ||
      /^0+$/.test(actionId) ||
      actionId.length < 8;

    if (isProbe) {
      return new NextResponse(null, { status: 410 });
    }
  }

  const accessRedirect = evaluateRouteAccess(request);
  if (accessRedirect) {
    return accessRedirect;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
