import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/categories → Fetch all active categories (Public)
 * Used for dropdowns, listings, etc. Anyone can access
 * 
 * Query Parameters:
 * - parentOnly: boolean - If true, returns only parent categories (no parentId)
 * - includeChildren: boolean - If true, includes children in the response
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parentOnly = searchParams.get('parentOnly') === 'true';
    const includeChildren = searchParams.get('includeChildren') === 'true';

    // Build where clause
    const whereClause: any = {
      isActive: true,
    };

    if (parentOnly) {
      whereClause.parentId = null;
    }

    // Fetch categories
    const categories = await prisma.serviceCategory.findMany({
      where: whereClause,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        ...(includeChildren && {
          children: {
            where: {
              isActive: true,
            },
            orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          },
        }),
        _count: {
          select: {
            children: true,
            services: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    // Format response for easier frontend consumption
    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      displayOrder: cat.displayOrder,
      parentId: cat.parentId,
      parent: cat.parent,
      childrenCount: cat._count.children,
      servicesCount: cat._count.services,
      ...(includeChildren && cat.children && { children: cat.children }),
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedCategories,
        total: formattedCategories.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch categories', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
