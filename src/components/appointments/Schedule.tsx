// src/components/appointments/Schedule.tsx
'use client';
import React from 'react';
import { Appointment } from '@/types';
import { AppointmentItem } from './AppointmentItem';

export const Schedule: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  if (!appointments.length) {
    return <div className="p-6 text-center text-gray-500">No appointments for selected date.</div>;
  }

  return (
    <div className="space-y-4">
      {appointments.map(a => <AppointmentItem key={a.id} appt={a} />)}
    </div>
  );
};
