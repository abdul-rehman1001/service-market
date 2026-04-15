import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { setTokenCookie } from '@/lib/cookies';
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
  const body = await req.json();
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

  // Create user with UNVERIFIED status (stays UNVERIFIED until all verifications done)
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
      status: 'UNVERIFIED', // Will be set to ACTIVE after email + phone verification
    },
  });

  // If registering as PROVIDER, create ServiceProvider profile
  if (role === 'PROVIDER') {
    try {
      const providerData: Prisma.ServiceProviderCreateInput = {
        user: { connect: { id: user.id } },
        yearsOfExperience: 0,
        cnic: null,
        verificationStatus: 'PENDING',
        baseAddress: resolvedAddress,
        longitude: new Prisma.Decimal(resolvedLongitude),
        latitude: new Prisma.Decimal(resolvedLatitude),
      };

      await prisma.serviceProvider.create({
        data: providerData,
      });
    } catch (providerError) {
      console.error('Error creating provider profile:', providerError);
      // Continue anyway - provider profile can be updated later
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

  // Create JWT token for session
  const token = signToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    user: { 
      id: user.id, 
      email: user.email, 
      name: `${user.firstName} ${user.lastName}`, 
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
    message: 'Registration successful. Please verify your email and phone.',
  });

  setTokenCookie(res, token);
  return res;
}
