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
          className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="flex-1">
            <h3 className="font-semibold text-lg sm:text-xl mb-2">{service.name}</h3>
            <p className="text-gray-600 text-sm sm:text-base">{service.description}</p>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-blue-600 block">{service.price}</span>
            <span className="text-xs sm:text-sm text-gray-500">Starting from</span>
          </div>
        </div>
      ))}
    </div>
  );
}
