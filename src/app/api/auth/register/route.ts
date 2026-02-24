import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { setTokenCookie } from '@/lib/cookies';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { name, email, password, role, profileImage, phone } = await req.json();

  if (!name || !email || !password || !role || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

  // Create user with UNVERIFIED status (stays UNVERIFIED until all verifications done)
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      profileImage: profileImage || null,
      phone,
      status: 'UNVERIFIED', // Will be set to ACTIVE after email + phone verification
    },
  });

  // If registering as PROVIDER, create ServiceProvider profile
  if (role === 'PROVIDER') {
    try {
      await prisma.serviceProvider.create({
        data: {
          userId: user.id,
          yearsOfExperience: 0,
          cnic: null,
          verificationStatus: 'PENDING',
        } as any,
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
