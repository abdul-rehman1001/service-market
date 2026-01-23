'use client';

import { Appointment } from '@/types';

export const AppointmentsPanel: React.FC = () => {
  const appointments: Appointment[] = [
    {
      id: 'a1',
      time: '09:00 AM',
      name: 'Sarah Jenkins',
      service: 'AC Repair',
      durationMin: 120,
      status: 'Upcoming',
    },
    {
      id: 'a2',
      time: '11:00 AM',
      name: 'John Doe',
      service: 'Plumbing',
      durationMin: 90,
      status: 'Upcoming',
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          Appointments
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your upcoming scheduled jobs
        </p>
      </div>

      {/* Appointment List */}
      <div className="space-y-4">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="
              bg-white border border-slate-200 rounded-xl p-5
              flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
              shadow-sm transition-all duration-300 ease-out
              hover:shadow-md
            "
          >
            {/* Appointment Info */}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                {a.name}
                <span className="text-slate-500 font-normal">
                  {' '}
                  — {a.service}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                {a.time} • {a.durationMin} mins
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="
                  px-4 py-1.5 rounded-lg text-sm font-medium
                  bg-emerald-600 text-white
                  transition-all duration-200
                  hover:bg-emerald-700 hover:shadow-sm
                  active:scale-95
                "
              >
                Accept
              </button>

              <button
                className="
                  px-4 py-1.5 rounded-lg text-sm font-medium
                  bg-rose-600 text-white
                  transition-all duration-200
                  hover:bg-rose-700 hover:shadow-sm
                  active:scale-95
                "
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
