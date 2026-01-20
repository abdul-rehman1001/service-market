import React from 'react';
import { Provider } from '@/types/provider';
import StarRating from './StarRating';

interface Props {
  provider: Provider;
}

export default function ProviderHeader({ provider }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <img
          src={provider.avatar}
          alt={provider.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 w-full text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{provider.name}</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-2">
          {Array.isArray(provider.services) ? provider.services.join(', ') : ''}
        </p>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
          <StarRating
            rating={provider.averageRating ?? 0}
            showRating
            reviewCount={provider.reviews ? provider.reviews.length : 0}
          />
          <div className="flex items-center text-gray-500 gap-1">
            <span className="material-icons">place</span>
            <span className="text-sm sm:text-base">{provider.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
          {(
            Array.isArray(provider.category)
              ? provider.category
              : typeof provider.category === 'string' && provider.category
                ? [provider.category]
                : []
          ).map((tag: string, index: number) => (
            <span key={index} className="bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="material-icons text-blue-500">workspace_premium</span>
            <span>{provider.yearsOfExperience ?? 0} yrs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-green-500">groups</span>
            <span>{provider.jobsCompleted ?? 0} jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-orange-500">schedule</span>
            <span>{provider.avgResponseTime ?? 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-purple-500">attach_money</span>
            <span>{provider.price ?? 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
