'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader, AlertCircle, Clock } from 'lucide-react';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

interface Appointment {
  id: string;
  time: string;
  name: string;
  service: string;
  durationMin: number;
  status: string;
  scheduledStart?: string;
  scheduledEnd?: string;
}

interface Booking {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  seeker?: {
    firstName: string;
    lastName: string;
  };
  service?: {
    name: string;
  };
}

export const AppointmentsPanel: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      // Filter to show upcoming confirmed and in-progress bookings
      const now = new Date();
      const upcoming = (data.bookings || [])
        .filter((b: Booking) => {
          const startTime = new Date(b.scheduledStart);
          return (
            ['CONFIRMED', 'IN_PROGRESS', 'EN_ROUTE'].includes(b.status) &&
            startTime > now
          );
        })
        .sort((a: Booking, b: Booking) => 
          new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
        );

      // Format into appointments
      const formattedAppointments = upcoming.map((booking: Booking) => {
        const startTime = new Date(booking.scheduledStart);
        const endTime = new Date(booking.scheduledEnd);
        const durationMin = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );

        return {
          id: booking.id,
          time: format(startTime, 'hh:mm a'),
          name: booking.seeker
            ? `${booking.seeker.firstName} ${booking.seeker.lastName}`
            : 'Unknown',
          service: booking.service?.name || 'Service',
          durationMin,
          status: booking.status,
          scheduledStart: booking.scheduledStart,
          scheduledEnd: booking.scheduledEnd,
        };
      });

      setAppointments(formattedAppointments);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

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
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <Clock className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-500">No upcoming appointments at the moment</p>
        </div>
      ) : (
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
              <div className="space-y-2 flex-1">
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
                <p className="text-xs text-slate-500">
                  {format(new Date(a.scheduledStart!), 'EEEE, MMMM d, yyyy')}
                </p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  a.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : a.status === 'EN_ROUTE'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {a.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
