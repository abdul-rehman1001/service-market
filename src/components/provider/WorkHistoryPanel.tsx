'use client';

import { motion } from 'framer-motion';

interface WorkHistoryItem {
  id: string;
  date: string;
  customer: string;
  service: string;
  rating: number;
  status: 'Completed' | 'Cancelled' | 'No Show';
}

export const WorkHistoryPanel: React.FC = () => {
  const workHistory: WorkHistoryItem[] = [
    { id: 'w1', date: '2026-01-20', customer: 'Sarah Jenkins', service: 'AC Repair', rating: 5, status: 'Completed' },
    { id: 'w2', date: '2026-01-18', customer: 'John Doe', service: 'Plumbing', rating: 4, status: 'Completed' },
    { id: 'w3', date: '2026-01-15', customer: 'Michael Chen', service: 'Washing Machine Repair', rating: 0, status: 'Cancelled' },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Work History</h2>
        <p className="text-sm text-slate-500 mt-1">Review your past jobs including ratings and status.</p>
      </div>

      <div className="space-y-4">
        {workHistory.map((job) => (
          <motion.div
            key={job.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex justify-between items-center transition-all duration-300"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                {job.customer} - <span className="font-normal text-slate-600">{job.service}</span>
              </p>
              <p className="text-sm text-slate-500">Date: {job.date}</p>
              {job.rating > 0 && (
                <p className="text-sm text-yellow-500">
                  Rating: {'⭐'.repeat(job.rating)} ({job.rating}/5)
                </p>
              )}
            </div>

            <div
              className={`px-3 py-1 rounded-full font-medium text-sm ${
                job.status === 'Completed'
                  ? 'bg-green-100 text-green-700'
                  : job.status === 'Cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {job.status}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
