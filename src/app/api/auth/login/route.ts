import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';
import { setTokenCookie } from '@/lib/cookies';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  // Block suspended accounts before issuing tokens
  if (user.status === 'SUSPENDED') {
    return NextResponse.json(
      { error: 'Your account is suspended. Please contact the Servizo team for further details.' },
      { status: 403 }
    );
  }

  const token = signToken({ userId: user.id, role: user.role });

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });

  setTokenCookie(res, token);
  return res;
}
