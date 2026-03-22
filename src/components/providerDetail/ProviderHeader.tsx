import React from 'react';
import Image from 'next/image';
import { ProviderProfileType } from '@/types/provider';
import StarRating from './StarRating';
import { MapPin, Award, Briefcase, CheckCircle, Clock } from 'lucide-react';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderHeader({ provider }: Props) {
  const fullName = `${provider.user.firstName} ${provider.user.lastName}`;
  const businessName = provider.businessName || fullName;
  const categories = [...new Set(provider.services.map(s => s.category.name))].join(', ');
  const minPrice = provider.services.length > 0 
    ? Math.min(...provider.services.map(s => Number(s.minPrice)))
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        <Image
          src={provider.user.profileImage || '/images/avatar1.png'}
          alt={fullName}
          width={112}
          height={112}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-2 ring-gray-200"
        />
        {provider.verificationStatus === 'APPROVED' && (
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 w-full text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{businessName}</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-2">
          {categories || 'Service Provider'}
        </p>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
          <StarRating
            rating={Number(provider.averageRating)}
            showRating
            reviewCount={provider.totalReviews}
          />
          {provider.user.city && (
            <div className="flex items-center text-gray-500 gap-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm sm:text-base">{provider.user.city}</span>
            </div>
          )}
          {provider.isAvailable ? (
            <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Available Now
            </span>
          ) : (
            <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
              Currently Unavailable
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <Award className="w-5 h-5 text-blue-500" />
            <span>{provider.yearsOfExperience} {provider.yearsOfExperience === 1 ? 'year' : 'years'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Briefcase className="w-5 h-5 text-green-500" />
            <span>{provider.completedBookingsCount} jobs completed</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-orange-500" />
            <span>Quick Response</span>
          </div>
          {minPrice > 0 && (
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-purple-500 font-bold">$</span>
              <span>From ${minPrice}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
