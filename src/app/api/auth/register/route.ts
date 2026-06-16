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
import {
  normalizeAddress,
  normalizeEmail,
  normalizePakistanPhone,
  validateAddress,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePakistanPhone,
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
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const email = normalizeEmail(String(body.email ?? ''));
  const password = String(body.password ?? '');
  const role = String(body.role ?? '').trim();
  const profileImage = body.profileImage;
  const phone = String(body.phone ?? '').trim();
  const address = normalizeAddress(String(body.address ?? ''));

  if (!firstName || !email || !password || !role || !phone || !address) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const firstNameValidation = validateFirstName(firstName);
  if (!firstNameValidation.isValid) {
    return NextResponse.json(
      { error: firstNameValidation.error || 'Invalid first name' },
      { status: 400 }
    );
  }

  const lastNameValidation = validateLastName(lastName);
  if (!lastNameValidation.isValid) {
    return NextResponse.json(
      { error: lastNameValidation.error || 'Invalid last name' },
      { status: 400 }
    );
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

  const normalizedAddress = normalizeAddress(address);
  const addressValidation = validateAddress(normalizedAddress);
  if (!addressValidation.isValid) {
    return NextResponse.json(
      { error: addressValidation.error || 'Address is required' },
      { status: 400 }
    );
  }

  const phoneValidation = validatePakistanPhone(phone);
  if (!phoneValidation.isValid) {
    return NextResponse.json(
      { error: phoneValidation.error || 'Invalid phone number' },
      { status: 400 }
    );
  }

  const normalizedPhone = normalizePakistanPhone(phone);

  const existingUserByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingUserByEmail) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const existingUserByPhone = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  if (existingUserByPhone) {
    return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Store the address exactly as entered. Coordinates are set later (e.g.
  // profile update) — not during registration.
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role as 'SEEKER' | 'PROVIDER',
      profileImage: profileImage || null,
      phone: normalizedPhone,
      address: normalizedAddress,
      longitude: new Prisma.Decimal(0),
      latitude: new Prisma.Decimal(0),
      status: 'UNVERIFIED', // Will be set to ACTIVE after email verification
    },
  });

  if (role === 'PROVIDER') {
    try {
      await createServiceProviderProfile({
        userId: user.id,
        address: normalizedAddress,
        longitude: 0,
        latitude: 0,
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
      name: [user.firstName, user.lastName].filter(Boolean).join(' '), 
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
