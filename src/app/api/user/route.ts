export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { setSessionModeCookie } from '@/lib/cookies';

// GET /api/user — get the current logged-in user's basic info
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        profileImage: true,
        providerProfile: {
          select: {
            id: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasProviderProfile = Boolean(user.providerProfile);

    const res = NextResponse.json({
      user: {
        id: user.id,
        name: [user.firstName, user.lastName].filter(Boolean).join(" "),
        email: user.email,
        role: auth.role,
        accountRole: user.role,
        profileImage: user.profileImage,
        hasProviderProfile,
        canSwitchMode: user.role !== 'ADMIN' && hasProviderProfile,
        providerVerificationStatus: user.providerProfile?.verificationStatus ?? null,
      },
    });

    setSessionModeCookie(res, auth.role);
    return res;
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
