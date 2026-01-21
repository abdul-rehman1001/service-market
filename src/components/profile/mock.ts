import { ProviderProfile, SeekerProfile } from './types';

export const MOCK_PROVIDER: ProviderProfile = {
  id: 'p1',
  name: 'Ahmed Khan',
  email: 'ahmed@example.com',
  role: 'provider',
  location: 'San Francisco',
  rating: 4.9,
  totalReviews: 138,
  services: ['Pipe Repair', 'Leak Fix', 'Bathroom Installation'],
  bio: 'Experienced plumber specializing in residential repairs.',
};

export const MOCK_SEEKER: SeekerProfile = {
  id: 's1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'seeker',
  totalBookings: 12,
  memberSince: '2023',
};
