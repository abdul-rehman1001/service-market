'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Service } from '@/types';
import { PortfolioItem } from './PortfolioItem';

export const ServicesPanel: React.FC = () => {
  const [services, setServices] = useState<Service[]>([
    { id: 's1', title: 'AC Repair', durationMin: 120, price: 100, status: 'Active', image: '' },
    { id: 's2', title: 'Plumbing', durationMin: 90, price: 80, status: 'Active', image: '' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h2 className="text-2xl font-semibold text-slate-800">My Services</h2>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition active:scale-95">
          + Add New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <motion.div
            key={s.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm transition hover:shadow-md"
          >
            <img
              src={s.image || '/images/service1.png'}
              alt={s.title}
              className="h-40 w-full object-cover rounded-lg mb-3"
            />
            <h3 className="font-semibold text-slate-800 text-lg">{s.title}</h3>
            <p className="text-sm text-slate-600 mt-1">Duration: {s.durationMin} min</p>
            <p className="text-sm text-slate-600">Price: ${s.price}</p>
            <p className={`text-sm font-medium mt-1 ${s.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
              Status: {s.status}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition active:scale-95">
                Edit
              </button>
              <button className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition active:scale-95">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
