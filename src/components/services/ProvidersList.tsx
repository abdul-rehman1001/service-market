'use client';

import ProviderCard from '@/components/home/providers/ProviderCard';
import { motion } from 'framer-motion';

interface Provider {
  id: string;
  userId: string;
  name: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  bio: string | null;
  rating: number;
  totalReviews: number;
  totalJobsCompleted: number;
  yearsOfExperience: number;
  baseAddress: string;
  avatar?: string;
  role?: string;
  reviews?: number;
  description?: string;
  [key: string]: any;
}

interface Props {
  providers: any[];
  selectedProvider?: any | null;
  onProviderSelect?: (provider: any) => void;
}

export default function ProvidersList({
  providers,
  selectedProvider,
  onProviderSelect,
}: Props) {
  // Transform provider data to match ProviderCard expectations
  const transformProvider = (provider: Provider): any => ({
    id: provider.id,
    userId: provider.userId,
    avatar: provider.profileImage || '/images/avatar-placeholder.png',
    name: provider.name,
    role: provider.services?.[0]?.name || 'Service Provider',
    rating: provider.rating,
    reviews: provider.totalReviews,
    description: provider.bio || provider.services?.[0]?.description || 'Professional service provider',
  });

  return (
    <div className="space-y-4">
      {providers.map((provider, index) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onProviderSelect?.(provider)}
          className={`relative cursor-pointer transition-all rounded-2xl ${
            selectedProvider?.id === provider.id
              ? 'ring-2 ring-emerald-500 ring-offset-2 bg-emerald-50'
              : ''
          }`}
        >
          {/* Highlight indicator */}
          {selectedProvider?.id === provider.id && (
            <motion.div
              layoutId="highlight"
              className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-lg"
              transition={{ duration: 0.3 }}
            />
          )}

          <ProviderCard provider={transformProvider(provider)} />
        </motion.div>
      ))}
    </div>
  );
}
