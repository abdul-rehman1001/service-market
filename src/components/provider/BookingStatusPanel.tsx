'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  seeker?: {
    firstName: string;
    lastName: string;
  } | null;
  service?: {
    name: string;
  } | null;
}

export const BookingStatusPanel: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      // Filter to show confirmed, in progress, en route, and completed bookings
      const filtered = (data.bookings || []).filter((b: Booking) =>
        ['CONFIRMED', 'IN_PROGRESS', 'EN_ROUTE', 'COMPLETED'].includes(b.status)
      );
      setBookings(filtered);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800';
      case 'EN_ROUTE':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Job Status</h2>
        <p className="text-sm text-slate-500 mt-1">Track and manage your ongoing jobs</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No active bookings at the moment</p>
        </div>
      )}

      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="
              bg-white border border-slate-200 rounded-2xl p-5 shadow-md
              hover:shadow-lg transition-all duration-300 ease-out
            "
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {booking.seeker?.firstName} {booking.seeker?.lastName}{' '}
                  <span className="font-normal text-slate-600">- {booking.service?.name}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Scheduled: {format(new Date(booking.scheduledStart), 'PPPpp')}
                </p>
                {booking.location && (
                  <p className="text-sm text-slate-500">
                    Location: {booking.location}
                  </p>
                )}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                    booking.status
                  )}`}
                >
                  {formatStatus(booking.status)}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
