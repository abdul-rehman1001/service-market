import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

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
 * Permanently delete a user account and send confirmation email (Admin only)
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

    // Fetch user before deletion for email
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the user (cascade will handle related records)
    await prisma.user.delete({ where: { id } });

    // Send deletion confirmation email
    try {
      await sendEmail(
        user.email,
        'Account Deleted – Service Market',
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Account Deleted</h2>
          <p>Dear ${user.firstName} ${user.lastName},</p>
          <p>Your account on <strong>Service Market</strong> has been permanently deleted by an administrator.</p>
          <p>All your data, including profile information, bookings, and reviews, has been removed from our platform.</p>
          <p>If you believe this was done in error, please contact our support team.</p>
          <br/>
          <p style="color: #6b7280; font-size: 0.875rem;">– Service Market Team</p>
        </div>
        `
      );
    } catch (emailError) {
      console.error('Failed to send deletion email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ message: 'User permanently deleted' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
