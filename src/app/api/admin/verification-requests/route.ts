import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// GET - Fetch all verification requests
export async function GET(req: NextRequest) {
  try {
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

    // Verify user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can access verification requests' },
        { status: 403 }
      );
    }

    // Fetch all providers with pending verification
    const verificationRequests = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: {
          in: ['PENDING', 'REJECTED'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        verificationRequests: verificationRequests.map((provider) => {
          const hasPendingCnicFront = provider.documents.some(
            (doc) => doc.documentType === 'CNIC_FRONT' && doc.status === 'PENDING'
          );
          const hasPendingCnicBack = provider.documents.some(
            (doc) => doc.documentType === 'CNIC_BACK' && doc.status === 'PENDING'
          );

          return {
            id: provider.id,
            userId: provider.userId,
            businessName: provider.businessName,
            cnic: provider.cnic,
            yearsOfExperience: provider.yearsOfExperience,
            verificationStatus: provider.verificationStatus,
            createdAt: provider.createdAt,
            user: provider.user,
            documents: provider.documents,
            cnicRequestReady: hasPendingCnicFront && hasPendingCnicBack,
          };
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch verification requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    );
  }
}
