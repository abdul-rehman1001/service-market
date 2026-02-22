import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { setTokenCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  const { name, email, password, role, profileImage } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Split name into firstName and lastName
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || '';

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      profileImage: profileImage || null,
      phone: '', // Temporary placeholder, will be set during phone verification
    },
  });

  const token = signToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`, role: user.role },
  });

  setTokenCookie(res, token);
  return res;
}
