import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  REFRESH_TOKEN_COOKIE,
  setAccessTokenCookie,
  setPreferredModeCookie,
  setSessionModeCookie,
} from '@/lib/cookies';
import { getAuthFromRequest } from '@/lib/auth';
import { createServiceProviderProfile } from '@/lib/providerProfile';
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

    if (auth.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot become providers' },
        { status: 403 }
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

    if (user.providerProfile) {
      return NextResponse.json(
        { error: 'You already have a provider profile', hasProviderProfile: true },
        { status: 409 }
      );
    }

    let body: { address?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const address = String(body.address ?? user.address ?? '').trim();
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required to become a provider' },
        { status: 400 }
      );
    }

    await createServiceProviderProfile({
      userId: user.id,
      address,
    });

    const accessToken = await issueAccessTokenForSession({
      userId: user.id,
      activeMode: 'PROVIDER',
    });

    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (refreshToken) {
      await updateRefreshTokenActiveMode(refreshToken, 'PROVIDER');
    }

    const res = NextResponse.json({
      message: 'Provider profile created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        role: 'PROVIDER',
        accountRole: user.role,
        hasProviderProfile: true,
        canSwitchMode: true,
      },
      redirectTo: '/provider/dashboard',
    });

    setAccessTokenCookie(res, accessToken);
    setSessionModeCookie(res, 'PROVIDER');
    setPreferredModeCookie(res, 'PROVIDER');
    return res;
  } catch (error: unknown) {
    console.error('Become provider error:', error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Failed to create provider profile';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
