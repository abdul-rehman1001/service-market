// app/api/auth/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      phone: true, role: true, status: true,
      emailVerified: true, phoneVerified: true, profileImage: true,
    },
  });

  if (!user) return NextResponse.json({ error: `User not found with ID: ${userId}` }, { status: 404 });

  return NextResponse.json({ user });
}