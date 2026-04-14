import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

type DecodedToken = {
  userId: string;
  role: string;
};

function toNumber(decimalValue: Prisma.Decimal | number | null | undefined): number {
  if (decimalValue === null || decimalValue === undefined) return 0;
  if (typeof decimalValue === 'number') return decimalValue;
  return Number(decimalValue.toString());
}

function isValidCoordinate(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

async function getAuthenticatedProvider(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const decoded = verifyToken(token) as DecodedToken | null;
  if (!decoded?.userId) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }

  if (decoded.role !== 'PROVIDER') {
    return {
      error: NextResponse.json({ error: 'Only providers can access this route' }, { status: 403 }),
    };
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: decoded.userId },
    select: {
      id: true,
      userId: true,
      baseAddress: true,
      latitude: true,
      longitude: true,
      updatedAt: true,
      user: {
        select: {
          address: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  if (!provider) {
    return {
      error: NextResponse.json({ error: 'Provider profile not found' }, { status: 404 }),
    };
  }

  return { provider };
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedProvider(req);
    if (authResult.error) return authResult.error;

    const { provider } = authResult;

    const defaultLat = toNumber(provider.user.latitude);
    const defaultLng = toNumber(provider.user.longitude);
    const hasDefaultLocation = !(defaultLat === 0 && defaultLng === 0);

    return NextResponse.json(
      {
        providerId: provider.id,
        lastKnownLocation: {
          lat: toNumber(provider.latitude),
          lng: toNumber(provider.longitude),
          address: provider.baseAddress,
          updatedAt: provider.updatedAt,
        },
        hasDefaultLocation,
        defaultLocation: hasDefaultLocation
          ? {
              lat: defaultLat,
              lng: defaultLng,
              address: provider.user.address,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider location GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch provider location data' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await getAuthenticatedProvider(req);
    if (authResult.error) return authResult.error;

    const { provider } = authResult;
    const body = await req.json();
    const action = body?.action as string | undefined;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (action === 'update-current') {
      const lat = Number(body?.lat);
      const lng = Number(body?.lng);

      if (!isValidCoordinate(lat, lng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }

      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: {
          latitude: new Prisma.Decimal(lat),
          longitude: new Prisma.Decimal(lng),
        },
      });

      return NextResponse.json(
        {
          message: 'Current location updated',
          lastKnownLocation: {
            lat,
            lng,
            updatedAt: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    if (action === 'set-default') {
      const lat = Number(body?.lat);
      const lng = Number(body?.lng);

      if (!isValidCoordinate(lat, lng)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: provider.userId },
        data: {
          latitude: new Prisma.Decimal(lat),
          longitude: new Prisma.Decimal(lng),
        },
      });

      return NextResponse.json(
        {
          message: 'Default location saved',
          defaultLocation: {
            lat,
            lng,
          },
        },
        { status: 200 }
      );
    }

    if (action === 'use-default') {
      const defaultLat = toNumber(provider.user.latitude);
      const defaultLng = toNumber(provider.user.longitude);
      const defaultAddress = provider.user.address || provider.baseAddress;
      const hasDefaultLocation = !(defaultLat === 0 && defaultLng === 0);

      if (!hasDefaultLocation) {
        return NextResponse.json({ error: 'Default location is not set yet' }, { status: 400 });
      }

      await prisma.serviceProvider.update({
        where: { id: provider.id },
        data: {
          latitude: new Prisma.Decimal(defaultLat),
          longitude: new Prisma.Decimal(defaultLng),
          baseAddress: defaultAddress,
        },
      });

      return NextResponse.json(
        {
          message: 'Provider switched to default location',
          lastKnownLocation: {
            lat: defaultLat,
            lng: defaultLng,
            updatedAt: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Provider location PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update provider location' }, { status: 500 });
  }
}
