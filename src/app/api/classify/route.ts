import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/lib/classifier';

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
      category: result.category,
      categoryId: result.categoryId,
      categoryName: result.categoryName,
      confidence: result.confidence,
      allMatches: result.allMatches,
    });
  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: error.message || 'Classification failed' },
      { status: 500 }
    );
  }
}
