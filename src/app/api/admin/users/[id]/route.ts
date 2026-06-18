import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { deactivateUserAccount } from '@/lib/admin/account-deactivation';

/**
 * GET /api/admin/users/:id
 * Get complete user profile details (Admin only)
 */
export async function GET(
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

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        city: true,
        address: true,
        profileImage: true,
        bio: true,
        emailVerified: true,
        emailVerifiedAt: true,
        phoneVerified: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          select: {
            id: true,
            businessName: true,
            yearsOfExperience: true,
            cnic: true,
            verificationStatus: true,
            averageRating: true,
            totalReviews: true,
            totalJobsCompleted: true,
            isAvailable: true,
            baseAddress: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            bookingsAsSeeker: true,
            reviewsGiven: true,
            reviewsReceived: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/:id
 * Deactivate (soft-delete) a user account (Admin only).
 *
 * Marks the account as DELETED rather than removing the row, so the booking
 * history of any provider/seeker the user interacted with stays intact. Any
 * still-active bookings are cancelled, both parties are notified by email +
 * push, and all sessions are revoked. Deleted users are hidden from the admin
 * list and can no longer sign in.
 */
export async function DELETE(
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

    // Prevent admin from deleting themselves
    if (decoded.userId === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own admin account' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted' },
        { status: 400 }
      );
    }

    if (user.status === 'DELETED') {
      return NextResponse.json(
        { error: 'User is already deleted' },
        { status: 400 }
      );
    }

    const { cancelledBookings } = await deactivateUserAccount(id, {
      mode: 'DELETED',
    });

    return NextResponse.json({
      message: 'User account deleted',
      cancelledBookings,
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
