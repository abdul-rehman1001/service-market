import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { validateCategoryIcon } from '@/lib/categoryIcon';

function parseDisplayOrder(value: unknown): { ok: true; value: number } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    return { ok: true, value: 0 };
  }

  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return { ok: false, error: 'Display order must be 0 or a positive whole number' };
  }

  return { ok: true, value: parsed };
}

/**
 * PATCH /api/admin/categories/:id
 * Update a service category (Admin only)
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
        { error: 'Only admins can update categories' },
        { status: 403 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { name, description, icon, parentId, isActive, displayOrder } = body;

    // If name is being updated, check for uniqueness
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'Category name cannot be empty' },
          { status: 400 }
        );
      }

      // Check if another category has this name (excluding current category)
      const duplicateCategory = await prisma.serviceCategory.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        );
      }
    }

    // If parentId is being updated, verify it exists and prevent circular reference
    if (parentId !== undefined && parentId !== null) {
      // Prevent setting parent to itself
      if (parentId === id) {
        return NextResponse.json(
          { error: 'A category cannot be its own parent' },
          { status: 400 }
        );
      }

      const parentCategory = await prisma.serviceCategory.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }

      // Prevent circular reference (if parent's parent is this category)
      if (parentCategory.parentId === id) {
        return NextResponse.json(
          { error: 'Circular reference detected: parent category cannot be a child of this category' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (icon !== undefined) {
      const iconResult = validateCategoryIcon(icon);
      if (!iconResult.ok) {
        return NextResponse.json({ error: iconResult.error }, { status: 400 });
      }
      updateData.icon = iconResult.value;
    }
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (displayOrder !== undefined) {
      const displayOrderResult = parseDisplayOrder(displayOrder);
      if (!displayOrderResult.ok) {
        return NextResponse.json({ error: displayOrderResult.error }, { status: 400 });
      }
      updateData.displayOrder = displayOrderResult.value;
    }

    // Update the category
    const updatedCategory = await prisma.serviceCategory.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Category updated successfully',
        category: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/:id
 * Delete a service category (Admin only)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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
        { error: 'Only admins can delete categories' },
        { status: 403 }
      );
    }

    // Check if category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        children: true,
        services: true,
        portfolios: true,
        problemQueries: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has children
    if (category.children.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with subcategories',
          details: `This category has ${category.children.length} subcategory(ies). Please delete or reassign them first.`,
        },
        { status: 400 }
      );
    }

    // Check if category is being used by services
    if (category.services.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category in use',
          details: `This category is used by ${category.services.length} service(s). Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // Check if category has portfolios
    if (category.portfolios.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with portfolios',
          details: `This category has ${category.portfolios.length} portfolio item(s). Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // Check if category has problem queries
    if (category.problemQueries.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete category with queries',
          details: `This category has ${category.problemQueries.length} query(ies). Please reassign or delete them first.`,
        },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.serviceCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        message: 'Category deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}
