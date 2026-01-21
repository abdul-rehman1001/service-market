// src/components/dashboard/Sidebar.tsx
'use client';

import React from 'react';
import clsx from 'clsx';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'services' | 'appointments';
  setActiveTab: (t: 'services' | 'appointments') => void;
};

export const Sidebar: React.FC<Props> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/30 z-30 transition-opacity md:hidden',
          { 'opacity-100 pointer-events-auto': isOpen, 'opacity-0 pointer-events-none': !isOpen }
        )}
        onClick={onClose}
      />

      <aside
        className={clsx(
          'fixed z-40 left-0 top-0 h-full w-72 bg-white border-r border-gray-200 p-4 transform transition-transform',
          'md:static md:translate-x-0',
          { '-translate-x-full': !isOpen }
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Provider Menu</h3>
          <button className="md:hidden p-2" onClick={onClose}>✕</button>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('services')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-lg flex items-center justify-between',
              activeTab === 'services' ? 'bg-green-50 border border-green-200 text-green-800' : 'hover:bg-gray-50'
            )}
          >
            <div>
              <div className="text-sm font-medium">My Services</div>
              <div className="text-xs text-gray-500">Manage offerings</div>
            </div>
            <div className="text-xs">{/* optional count */}</div>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={clsx(
              'w-full text-left px-3 py-2 rounded-lg flex items-center justify-between',
              activeTab === 'appointments' ? 'bg-green-50 border border-green-200 text-green-800' : 'hover:bg-gray-50'
            )}
          >
            <div>
              <div className="text-sm font-medium">Appointments</div>
              <div className="text-xs text-gray-500">View schedule</div>
            </div>
            <div className="text-xs">{/* optional badge */}</div>
          </button>
        </nav>

        <div className="mt-6 border-t pt-4 text-sm text-gray-600">
          <div className="mb-2">Quick actions</div>
          <div className="flex flex-col gap-2">
            <button className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm">+ Add New Service</button>
            <button className="px-3 py-2 rounded-lg border text-sm">New Booking</button>
          </div>
        </div>
      </aside>
    </>
  );
};
