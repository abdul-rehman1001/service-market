import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

/**
 * GET /api/search/history
 * Retrieve user's search history (last 20 searches)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch last 20 search history items for the user
    const history = await prisma.searchHistory.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      select: {
        id: true,
        query: true,
        filters: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: history,
      total: history.length,
    });
  } catch (error: any) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch search history', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search/history
 * Save a search query to user's history
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { query, filters } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Check if the exact same query already exists recently (within last 5 minutes)
    const recentDuplicate = await prisma.searchHistory.findFirst({
      where: {
        userId: decoded.userId,
        query: query.trim(),
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      },
    });

    if (recentDuplicate) {
      // Don't create duplicate, just return success
      return NextResponse.json({
        success: true,
        message: 'Search already in recent history',
        data: recentDuplicate,
      });
    }

    // Create new search history entry
    const searchHistory = await prisma.searchHistory.create({
      data: {
        userId: decoded.userId,
        query: query.trim(),
        filters: filters || null,
      },
    });

    // Keep only last 20 searches - delete older ones
    const allHistory = await prisma.searchHistory.findMany({
      where: {
        userId: decoded.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    if (allHistory.length > 20) {
      const idsToDelete = allHistory.slice(20).map((h) => h.id);
      await prisma.searchHistory.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Search saved to history',
      data: searchHistory,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save search history', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search/history
 * Clear all search history for the user
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; role: string } | null;
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Delete all search history for the user
    const result = await prisma.searchHistory.deleteMany({
      where: {
        userId: decoded.userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} search history items`,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error('Error clearing search history:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear search history', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
