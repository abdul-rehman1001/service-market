// src/types/provider.ts

export interface ServiceCategoryType {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  defaultDurationMinutes: number;
  images: string[];
  isActive: boolean;
  category: ServiceCategoryType;
}

export interface PortfolioItemType {
  id: string;
  images: string[];
  description?: string | null;
  category: ServiceCategoryType;
}

export interface ProviderDocumentType {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

export interface ReviewType {
  id: string;
  rating: number;
  comment?: string | null;
  professionalism?: number | null;
  punctuality?: number | null;
  qualityOfWork?: number | null;
  communication?: number | null;
  valueForMoney?: number | null;
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
    profileImage?: string | null;
  };
}

export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string | null;
  profileImage?: string | null;
  bio?: string | null;
}

export interface ProviderProfileType {
  id: string;
  userId: string;
  businessName?: string | null;
  yearsOfExperience: number;
  verificationStatus: string;
  averageRating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  isAvailable: boolean;
  user: UserType;
  services: ServiceType[];
  portfolios: PortfolioItemType[];
  documents: ProviderDocumentType[];
  completedBookingsCount: number;
  reviews: ReviewType[];
}
