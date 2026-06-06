import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { setPreferredModeCookie } from '@/lib/cookies';
import { resolveInitialActiveMode } from '@/lib/auth';
import { establishAuthSession } from '@/lib/session';
import { createServiceProviderProfile } from '@/lib/providerProfile';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { geocodeAddress } from '@/lib/geocoding';
import {
  normalizeEmail,
  validateEmail,
  validatePassword,
} from '@/lib/validation/authValidation';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
  const name = String(body.name ?? '').trim();
  const email = normalizeEmail(String(body.email ?? ''));
  const password = String(body.password ?? '');
  const role = String(body.role ?? '').trim();
  const profileImage = body.profileImage;
  const phone = String(body.phone ?? '').trim();
  const address = String(body.address ?? '').trim();

  if (!name || !email || !password || !role || !phone || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return NextResponse.json(
      { error: emailValidation.error || 'Invalid email address' },
      { status: 400 }
    );
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return NextResponse.json(
      { error: passwordValidation.error || 'Invalid password' },
      { status: 400 }
    );
  }

  // Validate role
  const validRoles = ['SEEKER', 'PROVIDER'];
  if (!validRoles.includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be SEEKER or PROVIDER' },
      { status: 400 }
    );
  }

  const normalizedAddress = String(address).trim();
  if (!normalizedAddress) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Validate phone format
  if (!phone.startsWith('+')) {
    return NextResponse.json(
      { error: 'Phone must include country code (e.g., +92300123456)' },
      { status: 400 }
    );
  }

  const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingUserByEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const existingUserByPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingUserByPhone) {
    return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Split name into firstName and lastName
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  let resolvedAddress = normalizedAddress;
  let resolvedLongitude = 0;
  let resolvedLatitude = 0;

  if (role === 'PROVIDER') {
    try {
      const geocodeData = await geocodeAddress(normalizedAddress);
      resolvedAddress = geocodeData.formatted_address;
      resolvedLongitude = geocodeData.longitude;
      resolvedLatitude = geocodeData.latitude;
    } catch (error: unknown) {
      const geocodeErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to geocode provider address';

      return NextResponse.json(
        { error: geocodeErrorMessage },
        { status: 400 }
      );
    }
  }

  // Create user with UNVERIFIED status (becomes ACTIVE after email verification)
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role as 'SEEKER' | 'PROVIDER',
      profileImage: profileImage || null,
      phone,
      address: resolvedAddress,
      longitude: new Prisma.Decimal(resolvedLongitude),
      latitude: new Prisma.Decimal(resolvedLatitude),
      status: 'UNVERIFIED', // Will be set to ACTIVE after email verification
    },
  });

  if (role === 'PROVIDER') {
    try {
      await createServiceProviderProfile({
        userId: user.id,
        address: normalizedAddress,
        formattedAddress: resolvedAddress,
        longitude: resolvedLongitude,
        latitude: resolvedLatitude,
      });
    } catch (providerError) {
      console.error('Error creating provider profile:', providerError);
    }
  }

  try {
    // Create and send email verification token
    const emailToken = crypto.randomBytes(32).toString('hex');

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: emailToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/verify-email-registration?userId=${user.id}&emailToken=${emailToken}`;

    await sendEmail(
      user.email,
      'Verify Your Email - Service Market',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Welcome to Service Market! Please verify your email to activate your account.</p>
          <p>
            <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `
    );
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    // Don't fail registration if email fails, user can resend
  }

  const hasProviderProfile = role === 'PROVIDER';
  const activeMode = resolveInitialActiveMode({
    accountRole: user.role,
    hasProviderProfile,
  });
  const res = NextResponse.json({
    user: { 
      id: user.id, 
      email: user.email, 
      name: `${user.firstName} ${user.lastName}`, 
      role: activeMode,
      accountRole: user.role,
      hasProviderProfile,
      canSwitchMode: hasProviderProfile,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
    message: 'Registration successful. Please verify your email.',
  });

  await establishAuthSession(res, {
    userId: user.id,
    activeMode,
    rememberMe: false,
  });
  setPreferredModeCookie(res, activeMode);
  return res;
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray((error.meta as any)?.target)
          ? ((error.meta as any).target as string[])
          : [];
        const message = target.includes('email')
          ? 'Email already registered'
          : target.includes('phone')
            ? 'Phone number already registered'
            : 'Unique constraint failed';

        return NextResponse.json({ error: message }, { status: 409 });
      }
    }

    console.error('Register error:', error);
    const details =
      process.env.NODE_ENV !== 'production'
        ? error instanceof Error
          ? error.message
          : String(error)
        : undefined;

    return NextResponse.json(
      details ? { error: 'Registration failed', details } : { error: 'Registration failed' },
      { status: 500 },
    );
  }
}
