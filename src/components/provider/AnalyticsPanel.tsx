'use client';

import { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

export const AnalyticsPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    inProgressBookings: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }

      const bookings = data.bookings || [];
      const total = bookings.length;
      const completed = bookings.filter((b: any) => b.status === 'COMPLETED').length;
      const cancelled = bookings.filter((b: any) => ['CANCELLED', 'AUTO_CANCELLED'].includes(b.status)).length;
      const inProgress = bookings.filter((b: any) => ['IN_PROGRESS', 'EN_ROUTE', 'CONFIRMED'].includes(b.status)).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        totalBookings: total,
        completedBookings: completed,
        cancelledBookings: cancelled,
        inProgressBookings: inProgress,
        completionRate,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          Analytics Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Job completion trends, ratings, busiest hours, and exportable reports
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">{stats.totalBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-semibold text-emerald-700 mt-1">{stats.completedBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-semibold text-blue-700 mt-1">{stats.inProgressBookings}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Completion Rate</p>
            <p className="text-2xl font-semibold text-amber-700 mt-1">{stats.completionRate}%</p>
          </div>
        </div>
      )}
    </section>
  );
};
