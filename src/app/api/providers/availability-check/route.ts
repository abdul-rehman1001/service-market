import { NextRequest, NextResponse } from 'next/server';
import { filterAvailableProviderIds } from '@/lib/check-provider-availability';
import { normalizeTimeHHmm } from '@/lib/availability';

type ProviderPayload = {
  providerId: string;
  serviceId: string;
};

/**
 * POST /api/providers/availability-check
 * Batch-check which providers have a slot at the given date and time.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const time = typeof body.time === 'string' ? body.time.trim() : '';
    const providers = Array.isArray(body.providers) ? body.providers : [];

    if (!date || !time) {
      return NextResponse.json(
        { error: 'date and time are required' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const normalizedTime = normalizeTimeHHmm(time);
    if (!normalizedTime) {
      return NextResponse.json({ error: 'Invalid time format' }, { status: 400 });
    }

    const items: ProviderPayload[] = providers
      .filter(
        (p: unknown): p is ProviderPayload =>
          typeof p === 'object' &&
          p !== null &&
          typeof (p as ProviderPayload).providerId === 'string' &&
          typeof (p as ProviderPayload).serviceId === 'string'
      )
      .slice(0, 50);

    const availableProviderIds = await filterAvailableProviderIds(
      items,
      date,
      normalizedTime
    );

    return NextResponse.json({
      success: true,
      availableProviderIds,
      checked: items.length,
    });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
