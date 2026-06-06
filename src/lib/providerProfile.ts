import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { geocodeAddress } from '@/lib/geocoding';

export async function userHasProviderProfile(userId: string): Promise<boolean> {
  const profile = await prisma.serviceProvider.findUnique({
    where: { userId },
    select: { id: true },
  });
  return Boolean(profile);
}

export async function createServiceProviderProfile(params: {
  userId: string;
  address: string;
  formattedAddress?: string;
  longitude?: number;
  latitude?: number;
}): Promise<{ address: string; longitude: number; latitude: number }> {
  let resolvedAddress = params.formattedAddress ?? params.address;
  let resolvedLongitude = params.longitude ?? 0;
  let resolvedLatitude = params.latitude ?? 0;

  if (params.longitude === undefined || params.latitude === undefined) {
    const geocodeData = await geocodeAddress(params.address);
    resolvedAddress = geocodeData.formatted_address;
    resolvedLongitude = geocodeData.longitude;
    resolvedLatitude = geocodeData.latitude;
  }

  await prisma.serviceProvider.create({
    data: {
      user: { connect: { id: params.userId } },
      yearsOfExperience: 0,
      cnic: null,
      verificationStatus: 'PENDING',
      baseAddress: resolvedAddress,
      longitude: new Prisma.Decimal(resolvedLongitude),
      latitude: new Prisma.Decimal(resolvedLatitude),
    },
  });

  await prisma.user.update({
    where: { id: params.userId },
    data: {
      address: resolvedAddress,
      longitude: new Prisma.Decimal(resolvedLongitude),
      latitude: new Prisma.Decimal(resolvedLatitude),
    },
  });

  return {
    address: resolvedAddress,
    longitude: resolvedLongitude,
    latitude: resolvedLatitude,
  };
}
