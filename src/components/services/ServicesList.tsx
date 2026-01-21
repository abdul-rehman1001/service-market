// src/components/services/ServicesList.tsx
'use client';
import React from 'react';
import { Service } from '@/types';
import { ServiceCard } from './ServiceCard';

export const ServicesList: React.FC<{ services: Service[] }> = ({ services }) => {
  if (!services.length) {
    return <div className="p-6 text-center text-gray-500">No services yet — add one to get started.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((s) => <ServiceCard key={s.id} service={s} />)}
    </div>
  );
};
