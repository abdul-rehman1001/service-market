import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * DELETE /api/providers/unavailability/[id] → Delete unavailable date
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      userId: string;
      role: string;
    } | null;

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Find the provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // 3. Find and verify ownership
    const unavailableDate = await prisma.unavailableDate.findUnique({
      where: { id },
    });

    if (!unavailableDate) {
      return NextResponse.json(
        { error: 'Unavailable date not found' },
        { status: 404 }
      );
    }

    if (unavailableDate.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this unavailable date' },
        { status: 403 }
      );
    }

    // 4. Delete
    await prisma.unavailableDate.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Unavailable date deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unavailability DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete unavailable date' },
      { status: 500 }
    );
  }
}
