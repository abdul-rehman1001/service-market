import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/services/:id → View a single service (Public - no auth required)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, icon: true, description: true },
        },
        provider: {
          select: {
            id: true,
            businessName: true,
            averageRating: true,
            totalReviews: true,
            totalJobsCompleted: true,
            isAvailable: true,
            verificationStatus: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                city: true,
              },
            },
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service', details: error.message },
      { status: 500 }
    );
  }
}
