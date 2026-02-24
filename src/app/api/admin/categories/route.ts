import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/admin/categories
 * Fetch all service categories (Admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
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

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view categories' },
        { status: 403 }
      );
    }

    // Fetch all categories with their relationships
    const categories = await prisma.serviceCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            services: true,
            portfolios: true,
            problemQueries: true,
          },
        },
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(
      {
        categories,
        total: categories.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new service category (Admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
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

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create categories' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, description, icon, parentId, isActive, displayOrder } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category name already exists (case-insensitive)
    const existingCategory = await prisma.serviceCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const parentCategory = await prisma.serviceCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Create the category
    const category = await prisma.serviceCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        parentId: parentId || null,
        isActive: typeof isActive === 'boolean' ? isActive : true,
        displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}
