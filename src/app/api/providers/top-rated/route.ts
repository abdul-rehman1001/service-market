import { NextRequest, NextResponse } from 'next/server';
import { getTopRatedProvidersPage, formatProviderForDisplay } from '@/lib/providers';

/**
 * GET /api/providers/top-rated
 * 
 * Returns top-rated providers for the homepage
 * 
 * Query Parameters:
 * - limit (optional): Page size (default: 6)
 * - page (optional): Page number (default: 1)
 * - categoryId (optional): Filter providers by service category (includes subcategories)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const categoryId = searchParams.get('categoryId');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 50.' },
        { status: 400 }
      );
    }

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter. Must be >= 1.' },
        { status: 400 }
      );
    }

    const result = await getTopRatedProvidersPage({
      page,
      limit,
      categoryId: categoryId || null,
    });

    const providers = result.providers;

    // Format the data for frontend
    const formattedProviders = providers.map(formatProviderForDisplay);

    const totalPages = Math.ceil(result.total / result.limit);

    return NextResponse.json({
      success: true,
      data: formattedProviders,
      count: formattedProviders.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasMore: result.page < totalPages,
      },
      filters: { categoryId: categoryId || null },
    });
  } catch (error) {
    console.error('Error in GET /api/providers/top-rated:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top-rated providers' },
      { status: 500 }
    );
  }
}
