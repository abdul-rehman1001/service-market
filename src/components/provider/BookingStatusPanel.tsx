'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Job {
  id: string;
  customerName: string;
  service: string;
  scheduledTime: string; // ISO string
  status:
    | 'Pending'
    | 'Confirmed'
    | 'En Route'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled by User'
    | 'Cancelled by Provider';
}

export const BookingStatusPanel: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 'j1',
      customerName: 'Sarah Jenkins',
      service: 'AC Repair',
      scheduledTime: new Date().toISOString(),
      status: 'Confirmed',
    },
    {
      id: 'j2',
      customerName: 'Michael Chen',
      service: 'Washing Machine Repair',
      scheduledTime: new Date(new Date().getTime() + 3600000).toISOString(),
      status: 'Pending',
    },
  ]);

  const updateStatus = (id: string, newStatus: Job['status']) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
  };

  const statusColor = (status: Job['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'En Route':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled by User':
      case 'Cancelled by Provider':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Job Status</h2>
        <p className="text-sm text-slate-500 mt-1">Track and manage your ongoing jobs</p>
      </div>

      <ul className="space-y-4">
        {jobs.map((job) => (
          <li
            key={job.id}
            className="
              bg-white border border-slate-200 rounded-2xl p-5 shadow-md
              hover:shadow-lg transition-all duration-300 ease-out
            "
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  {job.customerName}{' '}
                  <span className="font-normal text-slate-600">- {job.service}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Scheduled: {format(new Date(job.scheduledTime), 'PPPpp')}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </div>

              {/* Action Buttons */}
              {['Pending', 'Confirmed', 'En Route', 'In Progress'].includes(job.status) && (
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                  {job.status !== 'Confirmed' && (
                    <button
                      className="
                        px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium
                        shadow transition hover:bg-emerald-700 active:scale-95
                      "
                      onClick={() => updateStatus(job.id, 'Confirmed')}
                    >
                      Confirm
                    </button>
                  )}
                  {job.status === 'Confirmed' && (
                    <button
                      className="
                        px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium
                        shadow transition hover:bg-blue-700 active:scale-95
                      "
                      onClick={() => updateStatus(job.id, 'En Route')}
                    >
                      En Route
                    </button>
                  )}
                  {job.status === 'En Route' && (
                    <button
                      className="
                        px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium
                        shadow transition hover:bg-orange-600 active:scale-95
                      "
                      onClick={() => updateStatus(job.id, 'In Progress')}
                    >
                      Start Job
                    </button>
                  )}
                  {job.status === 'In Progress' && (
                    <button
                      className="
                        px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium
                        shadow transition hover:bg-green-700 active:scale-95
                      "
                      onClick={() => updateStatus(job.id, 'Completed')}
                    >
                      Complete
                    </button>
                  )}
                  <button
                    className="
                      px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium
                      shadow transition hover:bg-rose-700 active:scale-95
                    "
                    onClick={() => {
                      const reason = prompt('Cancel reason (User/Provider)?', 'Cancelled by Provider');
                      if (reason) updateStatus(job.id, reason as Job['status']);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
