
import { NextRequest, NextResponse } from 'next/server';
import { classifyQuery } from '@/lib/classifier';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const result = await classifyQuery(query);

    return NextResponse.json({
      success: true,
      query,
      ...result
    });

  } catch (error: any) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: error.message || 'Classification failed' },
      { status: 500 }
    );
  }
}
