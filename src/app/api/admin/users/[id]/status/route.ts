import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * PATCH /api/admin/users/:id/status
 * Suspend or activate a user account (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent admin from suspending themselves
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'Cannot change your own account status' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be ACTIVE or SUSPENDED' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    return NextResponse.json({
      message: `User ${status === 'SUSPENDED' ? 'suspended' : 'activated'} successfully`,
      user: updated,
    });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status', details: error.message },
      { status: 500 }
    );
  }
}
