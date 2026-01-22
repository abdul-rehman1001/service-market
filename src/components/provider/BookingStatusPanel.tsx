'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Job {
  id: string;
  customerName: string;
  service: string;
  scheduledTime: string; // ISO string
  status: 'Pending' | 'Confirmed' | 'En Route' | 'In Progress' | 'Completed' | 'Cancelled by User' | 'Cancelled by Provider';
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
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Job Status</h2>
      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <p>
              <strong>{job.customerName}</strong> - {job.service}
            </p>
            <p className="text-sm text-gray-500">
              Scheduled: {format(new Date(job.scheduledTime), 'PPPpp')}
            </p>
            <p className="text-sm text-gray-500">Status: {job.status}</p>

            {['Pending', 'Confirmed', 'En Route', 'In Progress'].includes(job.status) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {job.status !== 'Confirmed' && (
                  <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded"
                    onClick={() => updateStatus(job.id, 'Confirmed')}
                  >
                    Confirm
                  </button>
                )}
                {job.status !== 'En Route' && job.status === 'Confirmed' && (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => updateStatus(job.id, 'En Route')}
                  >
                    En Route
                  </button>
                )}
                {job.status !== 'In Progress' && job.status === 'En Route' && (
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                    onClick={() => updateStatus(job.id, 'In Progress')}
                  >
                    Start Job
                  </button>
                )}
                {job.status !== 'Completed' && job.status === 'In Progress' && (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded"
                    onClick={() => updateStatus(job.id, 'Completed')}
                  >
                    Complete
                  </button>
                )}
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => {
                    const reason = prompt('Cancel reason (User/Provider)?', 'Cancelled by Provider');
                    if (reason) updateStatus(job.id, reason as Job['status']);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
