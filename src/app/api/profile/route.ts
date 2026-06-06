import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';

// GET - Fetch current user profile
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAuthFromRequest(req);

    if (!auth) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        city: true,
        address: true,
        profileImage: true,
        bio: true,
        emailVerified: true,
        emailVerifiedAt: true,
        phoneVerified: true,
        phoneVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          select: {
            id: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { providerProfile, ...userFields } = user;
    const hasProviderProfile = Boolean(providerProfile);

    return NextResponse.json({
      user: {
        ...userFields,
        activeMode: auth.role,
        hasProviderProfile,
        canSwitchMode: user.role !== 'ADMIN' && hasProviderProfile,
        providerVerificationStatus: providerProfile?.verificationStatus ?? null,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAuthFromRequest(req);

    if (!auth) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        providerProfile: { select: { id: true } },
      },
    });

    const hasProviderProfile = Boolean(existingUser?.providerProfile);

    const { firstName, lastName, city, address, bio, profileImage } = await req.json();

    // Validation
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const normalizedAddress = typeof address === 'string' ? address.trim() : '';
    let resolvedAddress = normalizedAddress;
    let resolvedLongitude: number | null = null;
    let resolvedLatitude: number | null = null;

    const shouldGeocodeProvider =
      hasProviderProfile && (auth.role === 'PROVIDER' || normalizedAddress);

    if (shouldGeocodeProvider && normalizedAddress) {
      try {
        const geocodeData = await geocodeAddress(normalizedAddress);
        resolvedAddress = geocodeData.formatted_address;
        resolvedLongitude = geocodeData.longitude;
        resolvedLatitude = geocodeData.latitude;
      } catch (error: any) {
        return NextResponse.json(
          { error: error?.message || 'Unable to geocode provider address' },
          { status: 400 }
        );
      }
    } else if (auth.role === 'PROVIDER' && hasProviderProfile && !normalizedAddress) {
      return NextResponse.json(
        { error: 'Address is required for providers' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const userData: any = {
        firstName,
        lastName,
        city: city || null,
        address: resolvedAddress || null,
        bio: bio || null,
        profileImage: profileImage || null,
      };

      if (hasProviderProfile && resolvedLongitude !== null && resolvedLatitude !== null) {
        userData.longitude = new Prisma.Decimal(resolvedLongitude);
        userData.latitude = new Prisma.Decimal(resolvedLatitude);
      }

      const user = await tx.user.update({
        where: { id: auth.userId },
        data: userData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          city: true,
          address: true,
          profileImage: true,
          bio: true,
          emailVerified: true,
          emailVerifiedAt: true,
          phoneVerified: true,
          phoneVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (hasProviderProfile && resolvedLongitude !== null && resolvedLatitude !== null) {
        await tx.serviceProvider.updateMany({
          where: { userId: auth.userId },
          data: {
            baseAddress: resolvedAddress,
            longitude: new Prisma.Decimal(resolvedLongitude),
            latitude: new Prisma.Decimal(resolvedLatitude),
          },
        });
      }

      return user;
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          ...updatedUser,
          activeMode: auth.role,
          hasProviderProfile,
          canSwitchMode: updatedUser.role !== 'ADMIN' && hasProviderProfile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
