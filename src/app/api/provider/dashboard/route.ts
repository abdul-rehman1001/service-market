import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can access this route' },
        { status: 403 }
      );
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
      select: {
        id: true,
        userId: true,
        businessName: true,
        verificationStatus: true,
        cnic: true,
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ provider }, { status: 200 });
  } catch (error) {
    console.error('Provider dashboard GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider dashboard data' },
      { status: 500 }
    );
  }
}
