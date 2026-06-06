'use client';

import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarDays,
  Loader2,
  ChevronDown,
  Ban,
  CircleDollarSign,
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { ReviewModal } from '@/components/bookings/ReviewModal';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { formatPKR } from '@/lib/utils';

interface Provider {
  id: string;
  businessName?: string;
  averageRating: number;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface Service {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  problemDescription: string;
  cancellationReason?: string;
  provider: Provider;
  service: Service;
  review?: Review | null;
  createdAt: string;
}

type TabKey = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const TABS: { key: TabKey; label: string; statuses: string[] }[] = [
  { key: 'ALL', label: 'All', statuses: [] },
  { key: 'PENDING', label: 'Pending', statuses: ['PENDING', 'HOLD'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'IN_PROGRESS', label: 'In Progress', statuses: ['IN_PROGRESS', 'EN_ROUTE'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'AUTO_CANCELLED'] },
];

const STATUS_CONFIG: Record<
  string,
  { badge: string; icon: ReactNode; label?: string }
> = {
  HOLD: {
    badge: 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]',
    icon: <Clock className="h-4 w-4 text-[#6B7280]" />,
  },
  PENDING: {
    badge: 'bg-[#FFF7ED] text-[#9A3412] border border-[#FDBA74]',
    icon: <AlertCircle className="h-4 w-4 text-[#F97316]" />,
  },
  CONFIRMED: {
    badge: 'bg-[#D1FAE5] text-[#059669] border border-[#6EE7B7]',
    icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" />,
  },
  EN_ROUTE: {
    badge: 'bg-[#D1FAE5] text-[#059669] border border-[#6EE7B7]',
    icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" />,
    label: 'En route',
  },
  IN_PROGRESS: {
    badge: 'bg-[#D1FAE5] text-[#059669] border border-[#6EE7B7]',
    icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" />,
    label: 'In progress',
  },
  COMPLETED: {
    badge: 'bg-[#F0FDF4] text-[#166534] border border-[#86EFAC]',
    icon: <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />,
  },
  CANCELLED: {
    badge: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
    icon: <XCircle className="h-4 w-4 text-[#EF4444]" />,
  },
  AUTO_CANCELLED: {
    badge: 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]',
    icon: <XCircle className="h-4 w-4 text-[#EF4444]" />,
    label: 'Auto cancelled',
  },
};

function getStatusDisplay(status: string) {
  const config = STATUS_CONFIG[status];
  return {
    badgeClass: config?.badge ?? 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]',
    icon: config?.icon ?? null,
    label: config?.label ?? status.replace(/_/g, ' '),
  };
}

function StatCard({
  label,
  value,
  icon,
  accentClass,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accentClass: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_1px_3px_rgba(17,24,39,0.06)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${accentClass}`}>
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5] text-[#059669]">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const reduceMotion = useReducedMotion();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    bookingId: '',
    providerName: '',
    serviceName: '',
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings');
        }
        setBookings(data.bookings || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab) return [];
    return bookings.filter((booking) => tab.statuses.includes(booking.status));
  }, [bookings, activeTab]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => ['PENDING', 'HOLD'].includes(b.status)).length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => ['CANCELLED', 'AUTO_CANCELLED'].includes(b.status)).length,
    }),
    [bookings]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: bookings.length };
    TABS.forEach((tab) => {
      if (tab.key !== 'ALL') {
        counts[tab.key] = bookings.filter((b) => tab.statuses.includes(b.status)).length;
      }
    });
    return counts;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <Header />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Page header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-[0_1px_3px_rgba(17,24,39,0.06),0_8px_24px_rgba(17,24,39,0.04)] sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            My bookings
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl lg:text-4xl">
            Your service appointments
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7280] sm:text-base">
            Track status, message providers, and leave reviews after completion.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<CalendarDays className="h-5 w-5" />}
            accentClass="text-[#111827]"
            delay={0.05}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock className="h-5 w-5" />}
            accentClass="text-[#F97316]"
            delay={0.1}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentClass="text-[#10B981]"
            delay={0.15}
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={<Ban className="h-5 w-5" />}
            accentClass="text-[#EF4444]"
            delay={0.2}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-[0_1px_3px_rgba(17,24,39,0.06)]">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key] ?? 0;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                    isActive
                      ? 'bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)]'
                      : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F9FAFB] text-[#6B7280]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="pb-12">
          {loading ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] px-6 py-16 text-center shadow-[0_1px_3px_rgba(17,24,39,0.06)]">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#10B981]" />
              <p className="mt-4 text-sm font-medium text-[#6B7280]">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-6 py-10 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#EF4444]" />
              <p className="font-semibold text-[#991B1B]">{error}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FFFFFF] px-6 py-14 text-center sm:py-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D1FAE5]">
                <CalendarDays className="h-8 w-8 text-[#059669]" />
              </div>
              <h3 className="text-lg font-bold text-[#111827] sm:text-xl">No bookings found</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
                {activeTab === 'ALL'
                  ? "You haven't booked any services yet. Browse providers and schedule your first appointment."
                  : `No ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} bookings right now.`}
              </p>
              {activeTab === 'ALL' && (
                <Link
                  href="/home"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#10B981] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)] transition hover:bg-[#059669]"
                >
                  Browse services
                </Link>
              )}
            </div>
          ) : (
            <motion.div layout className="space-y-4">
              {filteredBookings.map((booking, index) => {
                const isExpanded = expandedId === booking.id;
                const isCompleted = booking.status === 'COMPLETED';
                const hasReview = Boolean(booking.review);
                const providerName =
                  booking.provider.businessName ||
                  `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;
                const statusDisplay = getStatusDisplay(booking.status);

                return (
                  <motion.article
                    key={booking.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(17,24,39,0.06),0_8px_24px_rgba(17,24,39,0.04)] transition-shadow hover:shadow-[0_8px_32px_rgba(17,24,39,0.08)]"
                  >
                    {/* Card header band */}
                    <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 sm:px-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#D1FAE5] ring-2 ring-[#E5E7EB]">
                            {booking.provider.user.profileImage ? (
                              <Image
                                src={booking.provider.user.profileImage}
                                alt={providerName}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#10B981] text-lg font-bold text-white">
                                {booking.provider.user.firstName.charAt(0)}
                                {booking.provider.user.lastName.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold tracking-tight text-[#111827]">
                              {providerName}
                            </h2>
                            <p className="mt-0.5 text-sm font-medium text-[#6B7280]">
                              {booking.service.name}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {booking.provider.averageRating > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-2.5 py-1 text-xs font-semibold text-[#111827]">
                                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                                  {booking.provider.averageRating.toFixed(1)}
                                  <span className="font-normal text-[#6B7280]">
                                    ({booking.provider.totalReviews})
                                  </span>
                                </span>
                              )}
                              <span className="text-xs text-[#6B7280]">
                                #{booking.bookingNumber}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 self-start">
                          {statusDisplay.icon}
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusDisplay.badgeClass}`}
                          >
                            {statusDisplay.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="space-y-4 p-4 sm:p-6">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5]">
                            <Clock className="h-5 w-5 text-[#059669]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                              Scheduled
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[#111827]">
                              {format(new Date(booking.scheduledStart), 'PPP')}
                            </p>
                            <p className="mt-0.5 text-xs text-[#6B7280]">
                              {format(new Date(booking.scheduledStart), 'p')} –{' '}
                              {format(new Date(booking.scheduledEnd), 'p')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5]">
                            <MapPin className="h-5 w-5 text-[#059669]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                              Location
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#111827]">
                              {booking.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5]">
                          <CircleDollarSign className="h-5 w-5 text-[#059669]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Estimated price
                          </p>
                          <p className="mt-1 text-lg font-bold text-[#10B981]">
                            {formatPKR(booking.service.minPrice)} –{' '}
                            {formatPKR(booking.service.maxPrice)}
                          </p>
                        </div>
                      </div>

                      {['CANCELLED', 'AUTO_CANCELLED'].includes(booking.status) &&
                        booking.cancellationReason && (
                          <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#EF4444]">
                              Cancellation reason
                            </p>
                            <p className="mt-1 text-sm text-[#991B1B]">
                              {booking.cancellationReason}
                            </p>
                          </div>
                        )}

                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#10B981] transition hover:text-[#059669]"
                        >
                          {isExpanded ? 'Hide details' : 'View details'}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm leading-relaxed text-[#111827]">
                                {booking.problemDescription}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row">
                        <Link href={`/messages?bookingId=${booking.id}`} className="flex-1">
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#111827] transition hover:border-[#10B981] hover:bg-[#D1FAE5] hover:text-[#059669]"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message provider
                          </button>
                        </Link>

                        {isCompleted && !hasReview && (
                          <button
                            type="button"
                            onClick={() =>
                              setReviewModal({
                                isOpen: true,
                                bookingId: booking.id,
                                providerName,
                                serviceName: booking.service.name,
                              })
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)] transition hover:bg-[#059669]"
                          >
                            <Star className="h-4 w-4" />
                            Leave review
                          </button>
                        )}

                        {hasReview && (
                          <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3">
                            <Star className="h-4 w-4 fill-[#22C55E] text-[#22C55E]" />
                            <span className="text-sm font-semibold text-[#166534]">
                              Review submitted
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, bookingId: '', providerName: '', serviceName: '' })
        }
        bookingId={reviewModal.bookingId}
        providerName={reviewModal.providerName}
        serviceName={reviewModal.serviceName}
        onSuccess={() => {
          fetch('/api/bookings')
            .then((res) => res.json())
            .then((data) => {
              if (data.bookings) {
                setBookings(data.bookings);
              }
            })
            .catch((err) => console.error('Failed to refresh bookings:', err));
        }}
      />
    </div>
  );
}
