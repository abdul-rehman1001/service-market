'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { CountdownTimer } from '@/components/bookings/CountdownTimer';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  Wrench,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from 'lucide-react';

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
  { key: 'PENDING', label: 'New', statuses: ['PENDING'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'IN_PROGRESS', label: 'In Progress', statuses: ['IN_PROGRESS', 'EN_ROUTE'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'AUTO_CANCELLED'] },
];

function statusStyles(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'CONFIRMED':
      return 'bg-[#6FCF97]/25 text-[#1F6F5F] border-[#6FCF97]/40';
    case 'EN_ROUTE':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'COMPLETED':
      return 'bg-[#2FA084]/15 text-[#1F6F5F] border-[#2FA084]/30';
    case 'CANCELLED':
    case 'AUTO_CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-[#EEEEEE] text-[#1F6F5F]/70 border-[#6FCF97]/30';
  }
}

const transitionStyles: Record<string, string> = {
  EN_ROUTE: 'bg-blue-600 hover:bg-blue-700',
  IN_PROGRESS: 'bg-[#2FA084] hover:bg-[#1F6F5F]',
  COMPLETED: 'bg-[#1F6F5F] hover:bg-[#1a5c52]',
  CANCELLED: 'bg-red-600 hover:bg-red-700',
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

  const fetchBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TABS.forEach((tab) => {
      counts[tab.key] = bookings.filter((b) => tab.statuses.includes(b.status)).length;
    });
    return counts;
  }, [bookings]);

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
      setError(null);
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
      setStatusUpdateError(err instanceof Error ? err.message : 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const getNextStatusTransitions = (status: string) => {
    const transitions: Record<string, Array<{ label: string; value: string }>> = {
      PENDING: [],
      CONFIRMED: [
        { label: 'Start route', value: 'EN_ROUTE' },
        { label: 'Cancel', value: 'CANCELLED' },
      ],
      EN_ROUTE: [
        { label: 'Start job', value: 'IN_PROGRESS' },
        { label: 'Cancel', value: 'CANCELLED' },
      ],
      IN_PROGRESS: [
        { label: 'Complete', value: 'COMPLETED' },
        { label: 'Cancel', value: 'CANCELLED' },
      ],
      COMPLETED: [],
      CANCELLED: [],
      AUTO_CANCELLED: [],
      HOLD: [],
    };
    return transitions[status] || [];
  };

  const formatStatusLabel = (status: string) => status.replace(/_/g, ' ');

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">Booking Requests</h2>
          <p className="mt-1 text-sm text-[#1F6F5F]/65">
            Accept new jobs and track progress through completion
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#6FCF97]/50 bg-white px-3.5 py-2 text-sm font-semibold text-[#1F6F5F] shadow-sm transition hover:border-[#2FA084] hover:bg-[#EEEEEE] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tabCounts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2FA084] text-white shadow-md'
                  : 'border border-[#6FCF97]/40 bg-white text-[#1F6F5F] hover:bg-[#6FCF97]/10'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#EEEEEE] text-[#1F6F5F]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#6FCF97]/35 bg-white py-16">
          <Loader2 className="h-9 w-9 animate-spin text-[#2FA084]" />
          <p className="text-sm text-[#1F6F5F]/65">Loading bookings…</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#6FCF97]/50 bg-[#EEEEEE]/60 px-6 py-14 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#6FCF97]" />
          <h3 className="font-semibold text-[#1F6F5F]">No bookings in this tab</h3>
          <p className="mt-1 text-sm text-[#1F6F5F]/60">
            New requests will appear here when customers book your services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking) => {
            const isPending = booking.status === 'PENDING';
            const isExpanded = expandedId === booking.id;
            const customerName = `${booking.seeker?.firstName || 'Unknown'} ${booking.seeker?.lastName || ''}`.trim();

            return (
              <article
                key={booking.id}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_6px_24px_-16px_rgba(31,111,95,0.5)] transition hover:shadow-[0_10px_28px_-14px_rgba(31,111,95,0.55)] ${
                  isPending ? 'border-amber-300/80 ring-1 ring-amber-200/50' : 'border-[#6FCF97]/35'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Card header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEEEE]">
                          <User className="h-4 w-4 text-[#2FA084]" />
                        </div>
                        <p className="truncate font-semibold text-[#1F6F5F]">{customerName}</p>
                      </div>
                      <p className="mt-1 flex items-center gap-1 truncate pl-10 text-xs text-[#1F6F5F]/60">
                        <Wrench className="h-3 w-3 shrink-0" />
                        {booking.service?.name || 'Service'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 self-start rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusStyles(booking.status)}`}
                    >
                      {formatStatusLabel(booking.status)}
                    </span>
                  </div>

                  {/* Schedule & location */}
                  <div className="mt-4 space-y-2 rounded-xl border border-[#6FCF97]/25 bg-[#EEEEEE]/50 px-3 py-2.5 text-sm">
                    <p className="flex items-start gap-2 text-[#1F6F5F]">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#2FA084]" />
                      <span className="min-w-0 leading-snug">
                        {format(new Date(booking.scheduledStart), 'MMM d, yyyy')}
                        <br />
                        <span className="text-xs text-[#1F6F5F]/65">
                          {format(new Date(booking.scheduledStart), 'h:mm a')} –{' '}
                          {format(new Date(booking.scheduledEnd), 'h:mm a')}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-xs text-[#1F6F5F]/70">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2FA084]" />
                      <span className="min-w-0 break-words">{booking.location}</span>
                    </p>
                  </div>

                  {/* Details toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="mt-3 flex w-full items-center justify-center gap-1 text-xs font-semibold text-[#2FA084]"
                  >
                    {isExpanded ? (
                      <>
                        Hide details <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View problem details <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  {isExpanded && (
                    <p className="mt-2 rounded-lg border border-[#6FCF97]/25 bg-white px-3 py-2.5 text-sm leading-relaxed text-[#1F6F5F]/80">
                      {booking.problemDescription}
                    </p>
                  )}

                  {/* Countdown */}
                  {isPending && booking.providerResponseDeadline && (
                    <div className="mt-3 flex flex-col gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 sm:flex-row sm:items-center sm:justify-between">
                      <span>Respond within</span>
                      <CountdownTimer target={booking.providerResponseDeadline} />
                    </div>
                  )}

                  {(booking.status === 'AUTO_CANCELLED' || booking.status === 'CANCELLED') &&
                    booking.cancellationReason && (
                      <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        {booking.cancellationReason}
                      </p>
                    )}
                  {booking.status === 'AUTO_CANCELLED' && !booking.cancellationReason && (
                    <p className="mt-3 text-xs text-red-600">Auto cancelled (no response)</p>
                  )}
                </div>

                {/* Actions footer */}
                {isPending && (
                  <div className="flex flex-col gap-2 border-t border-[#EEEEEE] bg-[#EEEEEE]/40 p-3 sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6F5F] disabled:opacity-50"
                      onClick={() => respond(booking.id, 'ACCEPT')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Accept
                    </button>
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      onClick={() => respond(booking.id, 'REJECT')}
                      disabled={actionLoading === booking.id}
                    >
                      {actionLoading === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  </div>
                )}

                {!isPending &&
                  !['COMPLETED', 'CANCELLED', 'AUTO_CANCELLED'].includes(booking.status) && (
                    <div className="flex flex-col gap-2 border-t border-[#EEEEEE] bg-[#EEEEEE]/40 p-3 sm:flex-row sm:flex-wrap">
                      {getNextStatusTransitions(booking.status).map((transition) => {
                        const isCancel = transition.value === 'CANCELLED';
                        return (
                          <button
                            key={transition.value}
                            type="button"
                            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50 sm:min-w-[120px] ${
                              isCancel
                                ? 'bg-red-600 hover:bg-red-700'
                                : transitionStyles[transition.value] || 'bg-[#2FA084] hover:bg-[#1F6F5F]'
                            }`}
                            onClick={() => {
                              if (isCancel) {
                                setCancelModal({ bookingId: booking.id, isOpen: true });
                              } else {
                                updateStatus(booking.id, transition.value);
                              }
                            }}
                            disabled={actionLoading === booking.id}
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isCancel ? (
                              <XCircle className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {transition.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
              </article>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1F6F5F]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (actionLoading !== cancelModal.bookingId) {
              setCancelModal({ bookingId: '', isOpen: false });
              setCancelReason('');
              setStatusUpdateError(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border border-[#6FCF97]/40 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#1F6F5F]">Cancel booking</h3>
            </div>

            <p className="mb-4 text-sm text-[#1F6F5F]/70">
              Please provide a reason. The customer will be notified.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason…"
              className="w-full resize-none rounded-xl border border-[#6FCF97]/45 bg-white px-4 py-3 text-sm text-[#1F6F5F] focus:border-[#2FA084] focus:outline-none focus:ring-2 focus:ring-[#2FA084]/25"
              rows={3}
            />

            {statusUpdateError && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{statusUpdateError}</p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCancelModal({ bookingId: '', isOpen: false });
                  setCancelReason('');
                  setStatusUpdateError(null);
                }}
                className="flex-1 rounded-xl border border-[#6FCF97]/50 bg-[#EEEEEE] px-4 py-2.5 text-sm font-semibold text-[#1F6F5F] transition hover:bg-[#EEEEEE]/80 disabled:opacity-50"
                disabled={actionLoading === cancelModal.bookingId}
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => updateStatus(cancelModal.bookingId, 'CANCELLED', cancelReason)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                disabled={!cancelReason.trim() || actionLoading === cancelModal.bookingId}
              >
                {actionLoading === cancelModal.bookingId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
