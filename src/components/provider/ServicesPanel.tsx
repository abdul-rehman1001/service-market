'use client';

import { useState } from 'react';
import { Service } from '@/types';
import { PortfolioItem } from './PortfolioItem';

export const ServicesPanel: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
    { id: 's1', title: 'AC Repair', durationMin: 120, price: 100, status: 'Active', image: '' },
    { id: 's2', title: 'Plumbing', durationMin: 90, price: 80, status: 'Active', image: '' },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Services</h2>
      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg mb-4">+ Add New Service</button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.id} className="border rounded-lg p-4">
            <img src={s.image || '/images/service1.png'} alt={s.title} className="h-32 w-full object-cover mb-2 rounded" />
            <h3 className="font-semibold">{s.title}</h3>
            <p>Duration: {s.durationMin} min</p>
            <p>Price: ${s.price}</p>
            <p>Status: {s.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
