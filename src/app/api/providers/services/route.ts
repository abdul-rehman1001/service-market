import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * POST /api/providers/services → Create a new service (Provider only)
 * GET  /api/providers/services → List own services (Provider only)
 */

export async function POST(req: NextRequest) {
  try {
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

    // 2. Must be a PROVIDER
    if (decoded.role !== 'PROVIDER') {
      return NextResponse.json(
        { error: 'Only providers can create services' },
        { status: 403 }
      );
    }

    // 3. Find the provider profile
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: decoded.userId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider profile not found. Please complete registration first.' },
        { status: 404 }
      );
    }

    if (provider.verificationStatus !== 'APPROVED') {
      return NextResponse.json(
        {
          error: 'Please verify your identity before adding services.',
          code: 'VERIFICATION_REQUIRED',
          verificationStatus: provider.verificationStatus,
        },
        { status: 403 }
      );
    }

    // 4. Parse & validate body
    const body = await req.json();
    const { name, description, categoryId, minPrice, maxPrice, defaultDurationMinutes, isActive, images } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ error: 'Service description is required' }, { status: 400 });
    }

    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Validate images if provided
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        return NextResponse.json({ error: 'Images must be an array of URLs' }, { status: 400 });
      }
      // Validate each image is a valid URL string
      if (!images.every((img: any) => typeof img === 'string' && img.trim().length > 0)) {
        return NextResponse.json({ error: 'All images must be valid URLs' }, { status: 400 });
      }
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (isNaN(min) || min < 0) {
      return NextResponse.json({ error: 'Valid minimum price is required' }, { status: 400 });
    }

    if (isNaN(max) || max < 0) {
      return NextResponse.json({ error: 'Valid maximum price is required' }, { status: 400 });
    }

    if (min > max) {
      return NextResponse.json({ error: 'Minimum price cannot exceed maximum price' }, { status: 400 });
    }

    const duration = parseInt(defaultDurationMinutes);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Valid duration (in minutes) is required' }, { status: 400 });
    }

    // 5. Verify category exists and is active
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    if (!category.isActive) {
      return NextResponse.json({ error: 'Selected category is inactive' }, { status: 400 });
    }

    // 6. Create service
    const createData = {
      providerId: provider.id,
      categoryId,
      name: name.trim(),
      description: description.trim(),
      minPrice: min,
      maxPrice: max,
      defaultDurationMinutes: duration,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      images: Array.isArray(images) ? images.map((img: string) => img.trim()) : [],
    };

    console.log('Creating service with data:', JSON.stringify(createData, null, 2));

    const service = await prisma.service.create({
      data: createData,
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

    console.log('Service created successfully:', service.id);

    return NextResponse.json(
      { message: 'Service created successfully', service },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating service:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create service', 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
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
        { error: 'Only providers can access this route' },
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

    // 3. Fetch own services
    const services = await prisma.service.findMany({
      where: { providerId: provider.id },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ services, total: services.length }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching provider services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error.message },
      { status: 500 }
    );
  }
}
