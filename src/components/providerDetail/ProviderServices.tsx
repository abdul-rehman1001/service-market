import React from 'react';
import { Service } from '@/types/provider';

interface Props {
  services: Service[];
}

export default function ProviderServices({ services }: Props) {
  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row"
        >
          {/* Image */}
          <div className="sm:w-48 h-32 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
            {(service as any).images && (service as any).images.length > 0 ? (
              <img 
                src={(service as any).images[0]} 
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg sm:text-xl mb-2">{service.name}</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">{service.description}</p>
              {(service as any).images && (service as any).images.length > 1 && (
                <p className="text-xs text-gray-500">
                  +{(service as any).images.length - 1} more image{(service as any).images.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-bold text-blue-600 block">{service.price}</span>
              <span className="text-xs sm:text-sm text-gray-500">Starting from</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
