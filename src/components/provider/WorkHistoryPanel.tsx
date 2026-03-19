'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface WorkHistoryItem {
  id: string;
  date: string;
  customer: string;
  service: string;
  rating: number;
  status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reviewComment?: string;
}

interface Booking {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  seeker?: {
    firstName: string;
    lastName: string;
  } | null;
  service?: {
    name: string;
  } | null;
  review?: {
    rating: number;
    comment: string;
  } | null;
}

export const WorkHistoryPanel: React.FC = () => {
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkHistory();
  }, []);

  const fetchWorkHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      // Filter to completed and cancelled bookings
      const completedBookings = (data.bookings || []).filter((b: Booking) =>
        ['COMPLETED', 'CANCELLED', 'AUTO_CANCELLED'].includes(b.status)
      );

      // Format into work history items
      const history = completedBookings.map((booking: Booking) => ({
        id: booking.id,
        date: booking.scheduledEnd || booking.scheduledStart,
        customer: booking.seeker
          ? `${booking.seeker.firstName} ${booking.seeker.lastName}`
          : 'Unknown',
        service: booking.service?.name || 'Service',
        rating: booking.review?.rating || 0,
        status: booking.status === 'AUTO_CANCELLED' ? 'CANCELLED' : booking.status,
        reviewComment: booking.review?.comment,
      }));

      setWorkHistory(history);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Work History</h2>
        <p className="text-sm text-slate-500 mt-1">Review your past completed jobs including ratings</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : workHistory.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No work history yet. Complete bookings to build your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-700">Total Completed</p>
              <p className="text-2xl font-bold text-emerald-900">
                {workHistory.filter(w => w.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">Cancelled</p>
              <p className="text-2xl font-bold text-red-900">
                {workHistory.filter(w => w.status === 'CANCELLED').length}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">Avg Rating</p>
              <p className="text-2xl font-bold text-amber-900">
                {(
                  workHistory
                    .filter(w => w.rating > 0)
                    .reduce((sum, w) => sum + w.rating, 0) / 
                    Math.max(1, workHistory.filter(w => w.rating > 0).length)
                ).toFixed(1)}/5
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {workHistory.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {job.status === 'COMPLETED' && (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      )}
                      <p className="text-sm font-semibold text-slate-800">
                        {job.customer}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">{job.service}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(job.date), 'PPP')}
                    </p>
                    {job.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {'⭐'.repeat(Math.min(5, job.rating))}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {job.rating}/5
                        </span>
                      </div>
                    )}
                    {job.reviewComment && (
                      <p className="text-sm text-slate-600 italic border-l-2 border-emerald-400 pl-3 mt-2">
                        &quot;{job.reviewComment}&quot;
                      </p>
                    )}
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full font-medium text-sm whitespace-nowrap ${
                      job.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {job.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
