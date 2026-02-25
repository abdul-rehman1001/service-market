import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProviderDetailPage from '@/components/providerDetail/ProviderDetailPage';
import { ProviderProfileType } from '@/types/provider';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProviderData(providerId: string): Promise<ProviderProfileType | null> {
  try {
    // Fetch provider with all related data
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: providerId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            city: true,
            profileImage: true,
            bio: true,
          },
        },
        services: {
          where: { isActive: true },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              },
            },
          },
        },
        portfolios: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              },
            },
          },
        },
        documents: {
          where: {
            status: 'APPROVED',
          },
        },
        bookingsAsProvider: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!provider) {
      return null;
    }

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: provider.userId,
      },
      include: {
        reviewer: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent 20 reviews
    });

    return {
      ...provider,
      completedBookingsCount: provider.bookingsAsProvider.length,
      reviews,
    };
  } catch (error) {
    console.error('Error fetching provider data:', error);
    return null;
  }
}

export default async function ProviderPublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const provider = await getProviderData(id);

  if (!provider) {
    notFound();
  }

  return <ProviderDetailPage provider={provider} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const provider = await getProviderData(id);

  if (!provider) {
    return {
      title: 'Provider Not Found',
    };
  }

  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const businessName = provider.businessName || fullName;

  return {
    title: `${businessName} - Servizo`,
    description: provider.user.bio || `View ${businessName}'s profile, services, and reviews on Servizo`,
  };
}
