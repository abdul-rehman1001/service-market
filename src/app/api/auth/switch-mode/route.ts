import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { REFRESH_TOKEN_COOKIE, setAccessTokenCookie, setPreferredModeCookie } from '@/lib/cookies';
import {
  type ActiveMode,
  canUseActiveMode,
  getAuthFromRequest,
} from '@/lib/auth';
import {
  issueAccessTokenForSession,
  updateRefreshTokenActiveMode,
} from '@/lib/session';
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const requestedMode = String(body?.mode ?? '').toUpperCase() as ActiveMode;

    if (requestedMode !== 'SEEKER' && requestedMode !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be SEEKER or PROVIDER' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        providerProfile: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot switch modes' },
        { status: 403 }
      );
    }

    const hasProviderProfile = Boolean(user.providerProfile);

    if (
      !canUseActiveMode(requestedMode, {
        accountRole: user.role,
        hasProviderProfile,
      })
    ) {
      return NextResponse.json(
        { error: 'Provider profile required to switch to provider mode' },
        { status: 403 }
      );
    }

    const accessToken = await issueAccessTokenForSession({
      userId: user.id,
      activeMode: requestedMode,
    });

    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      await updateRefreshTokenActiveMode(refreshToken, requestedMode);
    }

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        role: requestedMode,
        accountRole: user.role,
        hasProviderProfile,
        canSwitchMode: hasProviderProfile,
      },
      redirectTo: requestedMode === 'PROVIDER' ? '/provider/dashboard' : '/home',
    });

    setAccessTokenCookie(res, accessToken);
    setPreferredModeCookie(res, requestedMode);
    return res;
  } catch (error) {
    console.error('Switch mode error:', error);
    return NextResponse.json({ error: 'Failed to switch mode' }, { status: 500 });
  }
}
