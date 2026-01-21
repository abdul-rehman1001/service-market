// src/components/dashboard/Dashboard.tsx
'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ServicesList } from '@/components/services/ServicesList';
import { Schedule } from '@/components/appointments/Schedule';
import { Service } from '@/types';
import { Appointment } from '@/types';

export const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'appointments'>('services');

  // Mock data (replace with fetch/useSWR)
  const services: Service[] = [
    { id: 's1', title: 'Deep Tissue Massage', durationMin: 60, price: 85, status: 'Active', image: '' },
    { id: 's2', title: 'Aromatherapy Session', durationMin: 45, price: 90, status: 'Active', image: '' },
    { id: 's3', title: 'Hot Stone Therapy', durationMin: 90, price: 120, status: 'Inactive', image: '' },
  ];

  const appointments: Appointment[] = [
    { id: 'a1', time: '09:00 AM', name: 'Sarah Jenkins', service: 'Initial Consultation', durationMin: 45, status: 'Upcoming' },
    { id: 'a2', time: '10:30 AM', name: 'Michael Chen', service: 'Deep Tissue Massage', durationMin: 60, status: 'Upcoming' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={(t) => { setActiveTab(t); setSidebarOpen(false); }}
      />

      <main className="flex-1">
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2" onClick={() => setSidebarOpen(true)}>☰</button>
            <h1 className="text-xl font-semibold">Provider Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <input className="hidden sm:block px-3 py-2 text-sm rounded-lg border" placeholder="Search services or appointments..." />
            <div className="w-10 h-10 bg-orange-300 rounded-full" />
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {/* Top Stats area (optional) */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">Clients<br /><strong>124</strong></div>
            <div className="bg-white p-4 rounded-lg border">Appointments<br /><strong>8</strong></div>
            <div className="bg-white p-4 rounded-lg border">Messages<br /><strong>3</strong></div>
            <div className="bg-white p-4 rounded-lg border">Profile<br /><strong>95%</strong></div>
          </div>

          {/* Panels */}
          <div>
            {activeTab === 'services' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">My Services</h2>
                  <button className="px-3 py-2 bg-teal-600 text-white rounded-lg">+ Add New Service</button>
                </div>
                <ServicesList services={services} />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Appointments</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 border rounded-lg">Today</button>
                    <button className="px-3 py-2 bg-teal-600 text-white rounded-lg">+ New Booking</button>
                  </div>
                </div>
                <Schedule appointments={appointments} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
