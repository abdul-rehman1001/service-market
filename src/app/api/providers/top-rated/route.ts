import { NextRequest, NextResponse } from 'next/server';
import { getTopRatedProviders, formatProviderForDisplay } from '@/lib/providers';

/**
 * GET /api/providers/top-rated
 * 
 * Returns top-rated providers for the homepage
 * 
 * Query Parameters:
 * - limit (optional): Number of providers to return (default: 6)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 50.' },
        { status: 400 }
      );
    }

    const providers = await getTopRatedProviders(limit);

    // Format the data for frontend
    const formattedProviders = providers.map(formatProviderForDisplay);

    return NextResponse.json({
      success: true,
      data: formattedProviders,
      count: formattedProviders.length,
    });
  } catch (error) {
    console.error('Error in GET /api/providers/top-rated:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top-rated providers' },
      { status: 500 }
    );
  }
}
