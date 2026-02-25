import React from 'react';
import Image from 'next/image';
import { ProviderProfileType } from '@/types/provider';
import { Clock, Tag } from 'lucide-react';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderServices({ provider }: Props) {
  if (provider.services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Services Available</h3>
          <p className="text-gray-500 text-sm">This provider hasn't listed any services yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {provider.services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Service Images Grid */}
          {service.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4">
              {service.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={img}
                    alt={`${service.name} ${idx + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg sm:text-xl mb-1">{service.name}</h3>
                <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                  {service.category.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  ${Number(service.minPrice).toFixed(2)}
                  {Number(service.minPrice) !== Number(service.maxPrice) && (
                    <span> - ${Number(service.maxPrice).toFixed(2)}</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">Price range</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm sm:text-base mb-4">{service.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{service.defaultDurationMinutes} minutes</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
