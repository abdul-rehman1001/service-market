import React from 'react';
import { Provider } from '@/types/provider';

interface Props {
  provider: Provider;
}

export default function ProviderOverview({ provider }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold">About {provider.name}</h2>
      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
        {provider.detailedDescription}
      </p>

      {/* Contact Info */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-3">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
            <span className="material-icons text-gray-400">phone</span>
            <span className="text-sm break-all">{provider.phone}</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md">
            <span className="material-icons text-gray-400">mail</span>
            <span className="text-sm break-all">{provider.email}</span>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">Availability</h3>
        <div className="flex flex-wrap gap-2">
          {provider.availability?.map((day, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm"
            >
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
