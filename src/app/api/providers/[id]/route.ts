import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET - Get provider by user ID or provider ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lookupId = params.id;

    // Get token and verify authentication
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

    let provider;

    // Try to find provider by userId first
    console.log('Looking up provider with lookupId:', lookupId);
    try {
      provider = await prisma.serviceProvider.findFirst({
        where: { userId: lookupId },
      });
      console.log('Found provider by userId:', provider?.id);
    } catch (err: any) {
      console.error('Error finding provider by userId:', err.message);
      throw err;
    }

    // If not found by userId, try by provider ID
    if (!provider) {
      try {
        provider = await prisma.serviceProvider.findUnique({
          where: { id: lookupId },
        });
        console.log('Found provider by provider ID:', provider?.id);
      } catch (err: any) {
        console.error('Error finding provider by ID:', err.message);
        throw err;
      }
    }

    // If still not found and looking up by userId, create provider profile
    if (!provider && lookupId === decoded.userId && decoded.role === 'PROVIDER') {
      try {
        console.log('Auto-creating provider profile for userId:', lookupId);
        provider = await prisma.serviceProvider.create({
          data: {
            userId: lookupId,
            yearsOfExperience: 0,
            cnic: null,
            verificationStatus: 'PENDING',
          } as any,
        });
        console.log('Auto-created provider profile:', provider.id);
      } catch (err: any) {
        console.error('Error creating provider profile:', err.message);
        throw err;
      }
    }

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found. Please contact support if you believe this is an error.' },
        { status: 404 }
      );
    }

    // Check authorization - only the provider themselves or admin
    if (provider.userId !== decoded.userId && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to view this provider profile' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        provider: {
          id: provider.id,
          userId: provider.userId,
          businessName: provider.businessName,
          yearsOfExperience: provider.yearsOfExperience,
          cnic: provider.cnic,
          verificationStatus: provider.verificationStatus,
          averageRating: provider.averageRating,
          totalReviews: provider.totalReviews,
          totalJobsCompleted: provider.totalJobsCompleted,
          isAvailable: provider.isAvailable,
          createdAt: provider.createdAt,
          updatedAt: provider.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get provider error:', error);
    const message =
      error?.message || 'Failed to fetch provider profile. Please try again.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
