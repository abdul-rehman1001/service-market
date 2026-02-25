import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * DELETE /api/providers/availability/[id] → Delete availability slot
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

    // 3. Find and verify ownership of availability
    const availability = await prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      return NextResponse.json(
        { error: 'Availability not found' },
        { status: 404 }
      );
    }

    if (availability.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this availability' },
        { status: 403 }
      );
    }

    // 4. Delete
    await prisma.availability.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Availability deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Availability DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability' },
      { status: 500 }
    );
  }
}
