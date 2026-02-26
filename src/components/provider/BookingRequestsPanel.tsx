'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CountdownTimer } from '@/components/bookings/CountdownTimer';
import { AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

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
  seeker?: {
    firstName: string;
    lastName: string;
  } | null;
  service?: {
    name: string;
  } | null;
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
  const [cancelModal, setCancelModal] = useState<{ bookingId: string; isOpen: boolean }>({
    bookingId: '',
    isOpen: false,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

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

  const updateStatus = async (bookingId: string, newStatus: string, cancellationReason?: string) => {
    try {
      setActionLoading(bookingId);
      setStatusUpdateError(null);

      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(cancellationReason && { cancellationReason }),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status');
      }

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
      setCancelModal({ bookingId: '', isOpen: false });
      setCancelReason('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update booking status';
      setStatusUpdateError(errorMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatusTransitions = (status: string) => {
    const transitions: Record<string, Array<{ label: string; value: string; color: string }>> = {
      PENDING: [],
      CONFIRMED: [
        { label: 'Start Route', value: 'EN_ROUTE', color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Cancel', value: 'CANCELLED', color: 'bg-rose-600 hover:bg-rose-700' },
      ],
      EN_ROUTE: [
        { label: 'Start Job', value: 'IN_PROGRESS', color: 'bg-sky-600 hover:bg-sky-700' },
        { label: 'Cancel', value: 'CANCELLED', color: 'bg-rose-600 hover:bg-rose-700' },
      ],
      IN_PROGRESS: [
        { label: 'Complete Job', value: 'COMPLETED', color: 'bg-purple-600 hover:bg-purple-700' },
        { label: 'Cancel', value: 'CANCELLED', color: 'bg-rose-600 hover:bg-rose-700' },
      ],
      COMPLETED: [],
      CANCELLED: [],
      AUTO_CANCELLED: [],
      HOLD: [],
    };
    return transitions[status] || [];
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
                      {booking.seeker?.firstName || 'Unknown'} {booking.seeker?.lastName || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">{booking.service?.name || 'Service'}</p>
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
                      className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                      onClick={() => respond(booking.id, 'ACCEPT')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Accept
                    </button>
                    <button
                      className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition flex items-center justify-center gap-2"
                      onClick={() => respond(booking.id, 'REJECT')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                {!isPending && !['COMPLETED', 'CANCELLED', 'AUTO_CANCELLED'].includes(booking.status) && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {getNextStatusTransitions(booking.status).map((transition) => (
                      <button
                        key={transition.value}
                        className={`px-3 py-2 rounded-lg text-white text-xs font-medium transition ${transition.color} flex-1 flex items-center justify-center gap-1.5`}
                        onClick={() => {
                          if (transition.value === 'CANCELLED') {
                            setCancelModal({ bookingId: booking.id, isOpen: true });
                          } else {
                            updateStatus(booking.id, transition.value);
                          }
                        }}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : transition.value === 'CANCELLED' ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {transition.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600" />
              <h3 className="text-lg font-semibold text-slate-800">Cancel Booking</h3>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to cancel this booking? Please provide a reason for cancellation.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              rows={3}
            />

            {statusUpdateError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{statusUpdateError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCancelModal({ bookingId: '', isOpen: false });
                  setCancelReason('');
                  setStatusUpdateError(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                disabled={actionLoading === cancelModal.bookingId}
              >
                Keep Booking
              </button>
              <button
                onClick={() => updateStatus(cancelModal.bookingId, 'CANCELLED', cancelReason)}
                className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition flex items-center justify-center gap-2"
                disabled={!cancelReason.trim() || actionLoading === cancelModal.bookingId}
              >
                {actionLoading === cancelModal.bookingId ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
