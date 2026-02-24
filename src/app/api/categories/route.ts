import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/categories → Fetch all active categories (Public)
 * Used for dropdowns, listings, etc. Anyone can access
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch only active categories with hierarchical data
    const categories = await prisma.serviceCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
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
