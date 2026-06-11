import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/lib/classifier';

export const runtime = 'nodejs';
// Allow time for cold starts (model download + embedding store load) on
// platforms like Vercel instead of being killed at the default timeout.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const result = await classifyQuery(query.trim());

    return NextResponse.json({
      success: true,
      query,
      matched: result.matched,
      category: result.category,
      categoryId: result.categoryId,
      categoryName: result.categoryName,
      confidence: result.confidence,
      allMatches: result.allMatches,
    });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json(
      {
        error:
          'We could not process your search right now. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
