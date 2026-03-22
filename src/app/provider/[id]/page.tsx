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
            documentType: 'CERTIFICATE',
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

    const serialized: ProviderProfileType = {
      id: provider.id,
      userId: provider.userId,
      businessName: provider.businessName,
      yearsOfExperience: provider.yearsOfExperience,
      verificationStatus: provider.verificationStatus,
      averageRating: Number(provider.averageRating),
      totalReviews: provider.totalReviews,
      totalJobsCompleted: provider.totalJobsCompleted,
      isAvailable: provider.isAvailable,
      user: {
        id: provider.user.id,
        firstName: provider.user.firstName,
        lastName: provider.user.lastName,
        email: provider.user.email,
        phone: provider.user.phone,
        city: provider.user.city,
        profileImage: provider.user.profileImage,
        bio: provider.user.bio,
      },
      services: provider.services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        minPrice: Number(service.minPrice),
        maxPrice: Number(service.maxPrice),
        defaultDurationMinutes: service.defaultDurationMinutes,
        images: service.images,
        isActive: service.isActive,
        category: {
          id: service.category.id,
          name: service.category.name,
          description: service.category.description,
          icon: service.category.icon,
        },
      })),
      portfolios: provider.portfolios.map((item) => ({
        id: item.id,
        images: item.images,
        description: item.description,
        category: {
          id: item.category.id,
          name: item.category.name,
          description: item.category.description,
          icon: item.category.icon,
        },
      })),
      documents: provider.documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        status: doc.status,
        uploadedAt: doc.uploadedAt.toISOString(),
      })),
      completedBookingsCount: provider.bookingsAsProvider.length,
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        professionalism: review.professionalism,
        punctuality: review.punctuality,
        qualityOfWork: review.qualityOfWork,
        communication: review.communication,
        valueForMoney: review.valueForMoney,
        createdAt: review.createdAt.toISOString(),
        reviewer: {
          firstName: review.reviewer.firstName,
          lastName: review.reviewer.lastName,
          profileImage: review.reviewer.profileImage,
        },
      })),
    };

    return serialized;
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
