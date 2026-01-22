'use client';

import { Appointment } from '@/types';

export const AppointmentsPanel: React.FC = () => {
  const appointments: Appointment[] = [
    { id: 'a1', time: '09:00 AM', name: 'Sarah Jenkins', service: 'AC Repair', durationMin: 120, status: 'Upcoming' },
    { id: 'a2', time: '11:00 AM', name: 'John Doe', service: 'Plumbing', durationMin: 90, status: 'Upcoming' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>
      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a.id} className="border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p><strong>{a.name}</strong> - {a.service}</p>
              <p>{a.time} | {a.durationMin} min</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
