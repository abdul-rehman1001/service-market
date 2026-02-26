'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CountdownTimer } from '@/components/bookings/CountdownTimer';

interface BookingItem {
  id: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  problemDescription: string;
  holdExpiresAt?: string | null;
  providerResponseDeadline?: string | null;
  cancellationReason?: string | null;
  seeker: {
    firstName: string;
    lastName: string;
  };
  service: {
    name: string;
  };
}

const TABS = [
  { key: 'PENDING', label: 'New Requests', statuses: ['PENDING'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'IN_PROGRESS', label: 'In Progress', statuses: ['IN_PROGRESS', 'EN_ROUTE'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'AUTO_CANCELLED'] },
];

const statusBadge = (status: string) => {
  switch (status) {
    case 'HOLD':
      return 'bg-slate-100 text-slate-700';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-800';
    case 'EN_ROUTE':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-sky-100 text-sky-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800';
    case 'AUTO_CANCELLED':
      return 'border border-rose-400 text-rose-700 bg-white';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

export const BookingRequestsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('PENDING');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredBookings = useMemo(() => {
    const tab = TABS.find((item) => item.key === activeTab);
    if (!tab) return [];
    return bookings.filter((booking) => tab.statuses.includes(booking.status));
  }, [activeTab, bookings]);

  const respond = async (bookingId: string, type: 'ACCEPT' | 'REJECT') => {
    try {
      setActionLoading(bookingId);
      const response = await fetch(`/api/provider/bookings/${bookingId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to respond');
      }
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to respond');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Bookings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage incoming requests and track job progress
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading bookings...</p>
      ) : error ? (
        <p className="text-rose-600">{error}</p>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No bookings here yet</h3>
          <p className="text-sm text-slate-500">New requests will show up as soon as they arrive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => {
            const isPending = booking.status === 'PENDING';
            const isExpanded = expandedId === booking.id;
            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 transition hover:shadow-md ${
                  isPending ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {booking.seeker.firstName} {booking.seeker.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{booking.service.name}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    {format(new Date(booking.scheduledStart), 'PPP')} •{' '}
                    {format(new Date(booking.scheduledStart), 'p')} -{' '}
                    {format(new Date(booking.scheduledEnd), 'p')}
                  </p>
                  <p className="text-xs text-slate-500">{booking.location}</p>
                </div>

                <div className="text-xs text-slate-600">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="text-emerald-700 font-semibold"
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                  </button>
                  {isExpanded && (
                    <p className="mt-2 text-slate-600">{booking.problemDescription}</p>
                  )}
                </div>

                {booking.status === 'PENDING' && booking.providerResponseDeadline && (
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <span>Respond within</span>
                    <CountdownTimer target={booking.providerResponseDeadline} />
                  </div>
                )}

                {booking.status === 'AUTO_CANCELLED' && (
                  <p className="text-xs text-rose-600">
                    {booking.cancellationReason || 'Auto cancelled due to no response'}
                  </p>
                )}

                {booking.status === 'CANCELLED' && booking.cancellationReason && (
                  <p className="text-xs text-rose-600">{booking.cancellationReason}</p>
                )}

                {isPending && (
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                      onClick={() => respond(booking.id, 'ACCEPT')}
                      disabled={actionLoading === booking.id}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition"
                      onClick={() => respond(booking.id, 'REJECT')}
                      disabled={actionLoading === booking.id}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
