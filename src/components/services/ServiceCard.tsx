// src/components/services/ServiceCard.tsx
'use client';
import React from 'react';
import { Service } from '@/types';

export const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
      <div className="h-36 rounded-md overflow-hidden bg-gray-100 mb-3 flex items-center justify-center">
        {service.image ? <img src={service.image} alt={service.title} className="w-full h-full object-cover" /> : <div className="text-gray-400">No image</div>}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{service.durationMin} min • ${service.price ?? '—'}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`text-xs px-2 py-1 rounded-full ${service.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          Status: {service.status}
        </div>
        <button className="text-sm px-3 py-1 border rounded-lg">Edit</button>
      </div>
    </div>
  );
};
