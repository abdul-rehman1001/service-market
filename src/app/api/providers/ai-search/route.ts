import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistance } from '@/lib/geocoding';
import { Prisma } from '@prisma/client';

interface ProviderWithDistance {
  id: string;
  userId: string;
  businessName: string | null;
  yearsOfExperience: number;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  isAvailable: boolean;
  baseAddress: string;
  longitude: number;
  latitude: number;
  user: {
    firstName: string;
    lastName: string;
    profileImage: string | null;
    bio: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    category: {
      id: string;
      name: string;
      parentId: string | null;
    };
  }>;
  distance?: number;
  minPrice?: number;
}

/**
 * GET /api/providers/ai-search
 * 
 * Search providers by category/subcategory with AI classification
 * Multi-level sorting: rating DESC, distance ASC, price ASC, experience DESC
 * Only returns verified and active providers
 * 
 * Query params:
 * - category: string (required)
 * - subcategory: string (optional)
 * - page: number (default: 1)
 * - limit: number (default: 12)
 * - userLat: number (optional - for distance calculation)
 * - userLng: number (optional - for distance calculation)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const userLat = searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : null;
    const userLng = searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : null;

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build category filter
    const categoryFilter: any = {
      OR: [
        { name: { contains: category, mode: 'insensitive' } },
        { 
          parent: { 
            name: { contains: category, mode: 'insensitive' } 
          } 
        }
      ]
    };

    if (subcategory) {
      categoryFilter.OR = [
        { 
          name: { contains: subcategory, mode: 'insensitive' },
          parent: { name: { contains: category, mode: 'insensitive' } }
        },
        { 
          name: { contains: subcategory, mode: 'insensitive' }
        }
      ];
    }

    // Find matching categories
    const categories = await prisma.serviceCategory.findMany({
      where: categoryFilter,
      select: { id: true }
    });

    const categoryIds = categories.map(c => c.id);

    if (categoryIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        message: 'No categories found matching the search criteria'
      });
    }

    // Find providers with services in these categories
    const providers = await prisma.serviceProvider.findMany({
      where: {
        verificationStatus: 'APPROVED',
        isAvailable: true,
        services: {
          some: {
            categoryId: {
              in: categoryIds
            },
            isActive: true
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
            bio: true,
          }
        },
        services: {
          where: {
            categoryId: {
              in: categoryIds
            },
            isActive: true
          },
          select: {
            id: true,
            name: true,
            description: true,
            minPrice: true,
            maxPrice: true,
            category: {
              select: {
                id: true,
                name: true,
                parentId: true
              }
            }
          }
        }
      }
    });

    // Calculate distance and prepare for sorting
    const providersWithDistance: ProviderWithDistance[] = providers.map(provider => {
      const providerData: ProviderWithDistance = {
        id: provider.id,
        userId: provider.userId,
        businessName: provider.businessName,
        yearsOfExperience: provider.yearsOfExperience,
        verificationStatus: provider.verificationStatus,
        averageRating: parseFloat(provider.averageRating.toString()),
        totalReviews: provider.totalReviews,
        totalJobsCompleted: provider.totalJobsCompleted,
        isAvailable: provider.isAvailable,
        baseAddress: provider.baseAddress,
        longitude: parseFloat(provider.longitude.toString()),
        latitude: parseFloat(provider.latitude.toString()),
        user: provider.user,
        services: provider.services.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          minPrice: parseFloat(s.minPrice.toString()),
          maxPrice: parseFloat(s.maxPrice.toString()),
          category: s.category
        }))
      };

      // Calculate distance if user coordinates provided
      if (userLat !== null && userLng !== null) {
        providerData.distance = calculateDistance(
          userLat,
          userLng,
          providerData.latitude,
          providerData.longitude
        );
      }

      // Calculate minimum price from services
      if (providerData.services.length > 0) {
        providerData.minPrice = Math.min(...providerData.services.map(s => s.minPrice));
      }

      return providerData;
    });

    // Multi-level sorting
    // Primary: rating (descending)
    // Secondary: distance (ascending)
    // Tertiary: price (ascending)
    // Quaternary: years_of_experience (descending)
    const sortedProviders = providersWithDistance.sort((a, b) => {
      // Primary: Rating (descending)
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating;
      }

      // Secondary: Distance (ascending) - only if both have distance
      if (a.distance !== undefined && b.distance !== undefined) {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
      }

      // Tertiary: Price (ascending) - only if both have price
      if (a.minPrice !== undefined && b.minPrice !== undefined) {
        if (a.minPrice !== b.minPrice) {
          return a.minPrice - b.minPrice;
        }
      }

      // Quaternary: Experience (descending)
      return b.yearsOfExperience - a.yearsOfExperience;
    });

    // Apply pagination
    const paginatedProviders = sortedProviders.slice(skip, skip + limit);
    const total = sortedProviders.length;
    const totalPages = Math.ceil(total / limit);

    // Format response
    const formattedProviders = paginatedProviders.map(provider => ({
      id: provider.id,
      userId: provider.userId,
      name: provider.businessName || `${provider.user.firstName} ${provider.user.lastName}`,
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      profileImage: provider.user.profileImage,
      bio: provider.user.bio,
      rating: provider.averageRating,
      totalReviews: provider.totalReviews,
      totalJobsCompleted: provider.totalJobsCompleted,
      yearsOfExperience: provider.yearsOfExperience,
      baseAddress: provider.baseAddress,
      distance: provider.distance,
      minPrice: provider.minPrice,
      services: provider.services,
      verificationStatus: provider.verificationStatus
    }));

    return NextResponse.json({
      success: true,
      data: formattedProviders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      },
      filters: {
        category,
        subcategory
      }
    });

  } catch (error: any) {
    console.error('Error in AI search providers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search providers' },
      { status: 500 }
    );
  }
}
