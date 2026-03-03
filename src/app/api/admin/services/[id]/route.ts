import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET    /api/admin/services/:id → View service details (Admin only)
 * PATCH  /api/admin/services/:id → Update service (Admin only)
 * DELETE /api/admin/services/:id → Delete service (Admin only)
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
            verificationStatus: true,
            averageRating: true,
            totalReviews: true,
            totalJobsCompleted: true,
            isAvailable: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profileImage: true,
                city: true,
                status: true,
              },
            },
          },
        },
        bookings: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            scheduledStart: true,
            scheduledEnd: true,
            createdAt: true,
            seeker: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
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

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Parse body
    const body = await req.json();
    const { name, description, categoryId, minPrice, maxPrice, defaultDurationMinutes, isActive, images } = body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'Service name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return NextResponse.json({ error: 'Service description cannot be empty' }, { status: 400 });
      }
      updateData.description = description.trim();
    }

    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return NextResponse.json({ error: 'Images must be an array of URLs' }, { status: 400 });
      }
      if (!images.every((img: any) => typeof img === 'string' && img.trim().length > 0)) {
        return NextResponse.json({ error: 'All images must be valid URLs' }, { status: 400 });
      }
      updateData.images = images.map((img: string) => img.trim());
    }

    if (categoryId !== undefined) {
      if (!categoryId || typeof categoryId !== 'string') {
        return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      }
      const category = await prisma.serviceCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 400 });
      }
      updateData.categoryId = categoryId;
    }

    // Price validation
    const newMin = minPrice !== undefined ? parseFloat(minPrice) : undefined;
    const newMax = maxPrice !== undefined ? parseFloat(maxPrice) : undefined;

    if (newMin !== undefined) {
      if (isNaN(newMin) || newMin < 0) {
        return NextResponse.json({ error: 'Valid minimum price is required' }, { status: 400 });
      }
      updateData.minPrice = newMin;
    }

    if (newMax !== undefined) {
      if (isNaN(newMax) || newMax < 0) {
        return NextResponse.json({ error: 'Valid maximum price is required' }, { status: 400 });
      }
      updateData.maxPrice = newMax;
    }

    // Cross-validate min/max
    const finalMin = updateData.minPrice !== undefined ? Number(updateData.minPrice) : Number(existingService.minPrice);
    const finalMax = updateData.maxPrice !== undefined ? Number(updateData.maxPrice) : Number(existingService.maxPrice);
    if (finalMin > finalMax) {
      return NextResponse.json({ error: 'Minimum price cannot exceed maximum price' }, { status: 400 });
    }

    if (defaultDurationMinutes !== undefined) {
      const duration = parseInt(defaultDurationMinutes);
      if (isNaN(duration) || duration <= 0) {
        return NextResponse.json({ error: 'Valid duration (in minutes) is required' }, { status: 400 });
      }
      updateData.defaultDurationMinutes = duration;
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        provider: {
          select: {
            id: true,
            businessName: true,
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Service updated successfully', service: updatedService },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service', details: error.message },
      { status: 500 }
    );
  }
}

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

    // Check if service exists with active bookings
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'] },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Prevent deletion if there are active bookings
    if (service._count.bookings > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete service with active bookings',
          details: `This service has ${service._count.bookings} active booking(s). Please complete or cancel them first.`,
        },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service', details: error.message },
      { status: 500 }
    );
  }
}
