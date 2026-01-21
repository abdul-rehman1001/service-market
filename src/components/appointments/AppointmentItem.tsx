// src/components/appointments/AppointmentItem.tsx
'use client';
import React from 'react';
import { Appointment } from '@/types';

export const AppointmentItem: React.FC<{ appt: Appointment }> = ({ appt }) => {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
      <div className="w-14 text-sm text-center">
        <div className="text-xs text-gray-500">Time</div>
        <div className="text-lg font-medium">{appt.time}</div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {appt.avatar ? <img alt={appt.name} src={appt.avatar} className="w-full h-full object-cover" /> : null}
          </div>
          <div>
            <div className="font-medium">{appt.name}</div>
            <div className="text-sm text-gray-500">{appt.service} · {appt.durationMin} min</div>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm text-gray-500">{appt.status ?? 'Upcoming'}</div>
        <button className="mt-2 px-3 py-1 border rounded-lg text-sm">Check-in</button>
      </div>
    </div>
  );
};
