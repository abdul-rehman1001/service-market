'use client';

import { motion } from 'framer-motion';
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
  Inbox,
  Activity,
  CircleCheck,
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

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
      return 'border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]';
    case 'CONFIRMED':
      return 'border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]';
    case 'EN_ROUTE':
      return 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A5F]';
    case 'IN_PROGRESS':
      return 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]';
    case 'COMPLETED':
      return 'border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]';
    case 'CANCELLED':
    case 'AUTO_CANCELLED':
      return 'border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]';
    default:
      return 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]';
  }
}

const transitionStyles: Record<string, string> = {
  EN_ROUTE:
    'bg-[#1E3A5F] shadow-[0_4px_14px_rgba(30,58,95,0.3)] hover:bg-[#16304f] hover:shadow-[0_6px_20px_rgba(30,58,95,0.35)]',
  IN_PROGRESS:
    'bg-[#10B981] shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]',
  COMPLETED:
    'bg-[#059669] shadow-[0_4px_14px_rgba(5,150,105,0.35)] hover:bg-[#047857] hover:shadow-[0_6px_20px_rgba(5,150,105,0.4)]',
  CANCELLED:
    'bg-[#EF4444] shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:bg-[#DC2626] hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)]',
};

function StatPill({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'green' | 'navy' | 'amber';
}) {
  const styles = {
    green: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
    },
    navy: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]',
      label: 'text-[#6B7280]',
      value: 'text-[#1E3A5F]',
    },
    amber: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]',
      label: 'text-[#6B7280]',
      value: 'text-[#9A3412]',
    },
  }[variant];

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:block sm:rounded-2xl sm:p-5 ${styles.card}`}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:mb-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl ${styles.iconWrap}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className={`truncate text-xs font-semibold sm:text-sm ${styles.label}`}>{label}</p>
      </div>
      <p className={`shrink-0 text-xl font-bold sm:text-2xl md:text-3xl ${styles.value}`}>{value}</p>
    </div>
  );
}

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
      const response = await authenticatedFetch('/api/provider/bookings');
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

  const summary = useMemo(
    () => ({
      new: tabCounts.PENDING ?? 0,
      active: (tabCounts.CONFIRMED ?? 0) + (tabCounts.IN_PROGRESS ?? 0),
      completed: tabCounts.COMPLETED ?? 0,
    }),
    [tabCounts]
  );

  const respond = async (bookingId: string, type: 'ACCEPT' | 'REJECT') => {
    try {
      setActionLoading(bookingId);
      const response = await authenticatedFetch(`/api/provider/bookings/${bookingId}/respond`, {
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

      const response = await authenticatedFetch(`/api/bookings/${bookingId}/status`, {
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
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669]">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1E3A5F] sm:text-2xl">Booking Requests</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Accept new jobs and track progress through completion
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-all hover:border-[#10B981]/30 hover:bg-[#F5F7F8] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#10B981] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <StatPill label="New requests" value={summary.new} icon={Inbox} variant="amber" />
          <StatPill label="Active jobs" value={summary.active} icon={Activity} variant="navy" />
          <StatPill label="Completed" value={summary.completed} icon={CircleCheck} variant="green" />
        </div>
      )}

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
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]'
                  : 'border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#10B981]/40 hover:bg-[#F5F7F8]'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white py-16 shadow-sm">
          <Loader2 className="h-9 w-9 animate-spin text-[#10B981]" />
          <p className="text-sm text-[#6B7280]">Loading bookings…</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="font-semibold text-[#1E3A5F]">No bookings in this tab</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            New requests will appear here when customers book your services.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBookings.map((booking, index) => {
            const isPending = booking.status === 'PENDING';
            const isExpanded = expandedId === booking.id;
            const customerName = `${booking.seeker?.firstName || 'Unknown'} ${booking.seeker?.lastName || ''}`.trim();

            return (
              <motion.article
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -2 }}
                className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] ${
                  isPending
                    ? 'border-[#FED7AA] ring-1 ring-[#FEF3C7]'
                    : 'border-[#E5E7EB] hover:border-[#10B981]/25'
                }`}
              >
                <div className="p-4 sm:p-5">
                  {/* Card header */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                          <User className="h-4 w-4 text-[#1E3A5F]" />
                        </div>
                        <p className="truncate font-semibold text-[#111827]">{customerName}</p>
                      </div>
                      <p className="mt-1.5 flex items-center gap-1.5 truncate pl-[2.875rem] text-xs text-[#6B7280]">
                        <Wrench className="h-3 w-3 shrink-0 text-[#10B981]" />
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
                  <div className="mt-4 space-y-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-sm">
                    <p className="flex items-start gap-2 text-[#111827]">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                      <span className="min-w-0 leading-snug">
                        {format(new Date(booking.scheduledStart), 'MMM d, yyyy')}
                        <br />
                        <span className="text-xs text-[#6B7280]">
                          {format(new Date(booking.scheduledStart), 'h:mm a')} –{' '}
                          {format(new Date(booking.scheduledEnd), 'h:mm a')}
                        </span>
                      </span>
                    </p>
                    <p className="flex items-start gap-2 text-xs text-[#6B7280]">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
                      <span className="min-w-0 break-words">{booking.location}</span>
                    </p>
                  </div>

                  {/* Details toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold text-[#059669] transition-colors hover:bg-[#D1FAE5]/40"
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
                    <p className="mt-2 rounded-xl border border-l-4 border-[#E5E7EB] border-l-[#10B981] bg-white px-3 py-2.5 text-sm leading-relaxed text-[#374151]">
                      {booking.problemDescription}
                    </p>
                  )}

                  {/* Countdown */}
                  {isPending && booking.providerResponseDeadline && (
                    <div className="mt-3 flex flex-col gap-1 rounded-xl border border-[#FED7AA] bg-[#FEF3C7] px-3 py-2.5 text-xs font-semibold text-[#B45309] sm:flex-row sm:items-center sm:justify-between">
                      <span>Respond within</span>
                      <CountdownTimer target={booking.providerResponseDeadline} />
                    </div>
                  )}

                  {(booking.status === 'AUTO_CANCELLED' || booking.status === 'CANCELLED') &&
                    booking.cancellationReason && (
                      <p className="mt-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#DC2626]">
                        {booking.cancellationReason}
                      </p>
                    )}
                  {booking.status === 'AUTO_CANCELLED' && !booking.cancellationReason && (
                    <p className="mt-3 text-xs text-[#EF4444]">Auto cancelled (no response)</p>
                  )}
                </div>

                {/* Actions footer */}
                {isPending && (
                  <div className="flex flex-col gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row">
                    <button
                      type="button"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:opacity-50"
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
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-sm font-semibold text-[#EF4444] transition hover:bg-[#FEE2E2] disabled:opacity-50"
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
                    <div className="flex flex-col gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] p-3 sm:flex-row sm:flex-wrap">
                      {getNextStatusTransitions(booking.status).map((transition) => {
                        const isCancel = transition.value === 'CANCELLED';
                        return (
                          <button
                            key={transition.value}
                            type="button"
                            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50 sm:min-w-[120px] ${
                              isCancel
                                ? transitionStyles.CANCELLED
                                : transitionStyles[transition.value] ||
                                  'bg-[#10B981] shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:bg-[#059669]'
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
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Cancel modal */}
      {cancelModal.isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#111827]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-t-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F]">Cancel booking</h3>
            </div>

            <p className="mb-4 text-sm text-[#6B7280]">
              Please provide a reason. The customer will be notified.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason…"
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] shadow-sm transition focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
              rows={3}
            />

            {statusUpdateError && (
              <p className="mt-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs text-[#EF4444]">
                {statusUpdateError}
              </p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCancelModal({ bookingId: '', isOpen: false });
                  setCancelReason('');
                  setStatusUpdateError(null);
                }}
                className="flex-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-50"
                disabled={actionLoading === cancelModal.bookingId}
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => updateStatus(cancelModal.bookingId, 'CANCELLED', cancelReason)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] transition hover:bg-[#DC2626] disabled:opacity-50"
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
          </motion.div>
        </div>
      )}
    </section>
  );
};
