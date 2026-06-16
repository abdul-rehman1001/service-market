import crypto from 'crypto';
import type { NextResponse } from 'next/server';
import type { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { signAccessToken } from '@/lib/jwt';
import {
  clearAuthCookies,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setSessionModeCookie,
} from '@/lib/cookies';
import type { ActiveMode } from '@/lib/auth';

const REFRESH_TOKEN_BYTES = 48;

export const REFRESH_SHORT_DAYS = Number(process.env.REFRESH_TOKEN_SHORT_DAYS || 1);
export const REFRESH_LONG_DAYS = Number(process.env.REFRESH_TOKEN_LONG_DAYS || 30);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

function getRefreshExpiry(rememberMe: boolean): Date {
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + (rememberMe ? REFRESH_LONG_DAYS : REFRESH_SHORT_DAYS)
  );
  return expiresAt;
}

export interface AuthSessionResult {
  userId: string;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
  activeMode: ActiveMode;
}

export async function createAuthSession(params: {
  userId: string;
  activeMode: ActiveMode;
  rememberMe?: boolean;
}): Promise<AuthSessionResult> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { emailVerified: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isAdmin = user.role === 'ADMIN';
  if (!isAdmin && !user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const rememberMe = Boolean(params.rememberMe);
  const accessToken = signAccessToken({
    userId: params.userId,
    role: params.activeMode,
    emailVerified: isAdmin ? true : user.emailVerified,
  });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      tokenHash: hashToken(refreshToken),
      activeMode: params.activeMode as UserRole,
      rememberMe,
      expiresAt: getRefreshExpiry(rememberMe),
    },
  });

  return {
    userId: params.userId,
    accessToken,
    refreshToken,
    rememberMe,
    activeMode: params.activeMode,
  };
}

export function applyAuthSessionCookies(
  res: NextResponse,
  session: Pick<AuthSessionResult, 'accessToken' | 'refreshToken' | 'rememberMe' | 'activeMode'>
) {
  setAccessTokenCookie(res, session.accessToken);
  setRefreshTokenCookie(res, session.refreshToken, session.rememberMe);
  setSessionModeCookie(res, session.activeMode);
}

export async function establishAuthSession(
  res: NextResponse,
  params: {
    userId: string;
    activeMode: ActiveMode;
    rememberMe?: boolean;
  }
): Promise<AuthSessionResult> {
  const session = await createAuthSession(params);
  applyAuthSessionCookies(res, session);
  return session;
}

export async function issueAccessTokenForSession(params: {
  userId: string;
  activeMode: ActiveMode;
}): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { emailVerified: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isAdmin = user.role === 'ADMIN';
  if (!isAdmin && !user.emailVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  return signAccessToken({
    userId: params.userId,
    role: params.activeMode,
    emailVerified: isAdmin ? true : user.emailVerified,
  });
}

export async function updateRefreshTokenActiveMode(
  refreshTokenPlain: string,
  activeMode: ActiveMode
): Promise<void> {
  const tokenHash = hashToken(refreshTokenPlain);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    select: { id: true, revokedAt: true, expiresAt: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { activeMode: activeMode as UserRole },
  });
}

export async function rotateAuthSession(
  refreshTokenPlain: string
): Promise<AuthSessionResult | null> {
  const tokenHash = hashToken(refreshTokenPlain);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: { emailVerified: true, role: true },
  });

  if (!user) {
    return null;
  }

  if (user.role !== 'ADMIN' && !user.emailVerified) {
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  const activeMode = String(stored.activeMode).toUpperCase() as ActiveMode;
  const accessToken = signAccessToken({
    userId: stored.userId,
    role: activeMode,
    emailVerified: user.role === 'ADMIN' ? true : user.emailVerified,
  });
  const newRefreshToken = generateRefreshToken();

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: hashToken(newRefreshToken),
        activeMode: stored.activeMode,
        rememberMe: stored.rememberMe,
        expiresAt: stored.expiresAt,
        lastUsedAt: new Date(),
      },
    }),
  ]);

  return {
    userId: stored.userId,
    accessToken,
    refreshToken: newRefreshToken,
    rememberMe: stored.rememberMe,
    activeMode,
  };
}

export async function revokeRefreshToken(refreshTokenPlain: string): Promise<void> {
  const tokenHash = hashToken(refreshTokenPlain);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export function clearAuthSessionCookies(res: NextResponse) {
  clearAuthCookies(res);
}
