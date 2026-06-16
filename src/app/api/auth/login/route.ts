import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { setPreferredModeCookie } from '@/lib/cookies';
import { resolveInitialActiveMode } from '@/lib/auth';
import { establishAuthSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      providerProfile: {
        select: { id: true },
      },
    },
  });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  if (user.status === 'SUSPENDED') {
    return NextResponse.json(
      { error: 'Your account is suspended. Please contact the Servizo team for further details.' },
      { status: 403 }
    );
  }

  if (user.role !== 'ADMIN' && !user.emailVerified) {
    return NextResponse.json(
      {
        error: 'Please verify your email before signing in.',
        code: 'EMAIL_NOT_VERIFIED',
        userId: user.id,
      },
      { status: 403 }
    );
  }

  const hasProviderProfile = Boolean(user.providerProfile);
  const preferredMode = req.cookies.get('preferredMode')?.value ?? null;
  const activeMode = resolveInitialActiveMode({
    accountRole: user.role,
    hasProviderProfile,
    preferredMode,
  });

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: activeMode,
      accountRole: user.role,
      hasProviderProfile,
      canSwitchMode: user.role !== 'ADMIN' && hasProviderProfile,
    },
    rememberMe: Boolean(rememberMe),
  });

  await establishAuthSession(res, {
    userId: user.id,
    activeMode,
    rememberMe: Boolean(rememberMe),
  });

  setPreferredModeCookie(res, activeMode);
  return res;
}
