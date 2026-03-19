import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * DELETE /api/search/history/[id]
 * Delete a single search history entry
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = params;

    // Verify that the history entry belongs to the user before deleting
    const historyEntry = await prisma.searchHistory.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!historyEntry) {
      return NextResponse.json(
        { error: 'Search history entry not found' },
        { status: 404 }
      );
    }

    if (historyEntry.userId !== decoded.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own search history' },
        { status: 403 }
      );
    }

    // Delete the entry
    await prisma.searchHistory.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Search history entry deleted',
    });
  } catch (error: any) {
    console.error('Error deleting search history entry:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete search history entry', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
