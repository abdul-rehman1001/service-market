export type UserRole = 'provider' | 'seeker';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  location?: string;
}

export interface ProviderProfile extends BaseUser {
  role: 'provider';
  rating: number;
  totalReviews: number;
  services: string[];
  bio: string;
}

export interface SeekerProfile extends BaseUser {
  role: 'seeker';
  totalBookings: number;
  memberSince: string;
}

export type ProfileUser = ProviderProfile | SeekerProfile;
