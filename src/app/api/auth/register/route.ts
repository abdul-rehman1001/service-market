import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { setTokenCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  const token = signToken({ userId: user.id, role: user.role });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });

  setTokenCookie(res, token);
  return res;
}
