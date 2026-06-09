import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import {
  ActiveBookingsError,
  deleteOrDeactivateService,
  ServiceNotFoundError,
} from '@/lib/serviceDeletion';

/**
 * PATCH  /api/providers/services/:id → Update service (Owner only)
 * DELETE /api/providers/services/:id → Delete service (Owner only)
 */

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can update services' },
        { status: 403 }
      );
    }

    // 2. Find provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // 3. Find the service
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // 4. Check ownership
    if (existingService.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'You can only update your own services' },
        { status: 403 }
      );
    }

    // 5. Parse & validate body
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

    // If images are being updated, validate them
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return NextResponse.json({ error: 'Images must be an array of URLs' }, { status: 400 });
      }
      // Validate each image is a valid URL string
      if (!images.every((img: any) => typeof img === 'string' && img.trim().length > 0)) {
        return NextResponse.json({ error: 'All images must be valid URLs' }, { status: 400 });
      }
      updateData.images = images.map((img: string) => img.trim());
    }

    // If categoryId is being changed, verify it exists
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

      if (!category.isActive) {
        return NextResponse.json({ error: 'Selected category is inactive' }, { status: 400 });
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

    // Cross-validate min/max if both or one is being changed
    const finalMin = updateData.minPrice ? Number(updateData.minPrice) : Number(existingService.minPrice);
    const finalMax = updateData.maxPrice ? Number(updateData.maxPrice) : Number(existingService.maxPrice);
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

    // 6. Update service
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

    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can delete services' },
        { status: 403 }
      );
    }

    // 2. Find provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id },
      select: { id: true, providerId: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.providerId !== provider.id) {
      return NextResponse.json(
        { error: 'You can only delete your own services' },
        { status: 403 }
      );
    }

    const result = await deleteOrDeactivateService(id);

    if (result.action === 'deactivated') {
      return NextResponse.json(
        {
          action: 'deactivated',
          message: 'Service deactivated (booking history preserved)',
          details: `This service has ${result.bookingCount} past booking(s) and cannot be permanently removed.`,
          bookingCount: result.bookingCount,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { action: 'deleted', message: 'Service deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    if (error instanceof ServiceNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof ActiveBookingsError) {
      return NextResponse.json(
        {
          error: 'Cannot delete service with active bookings',
          details: error.message,
        },
        { status: 400 }
      );
    }

    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
