'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  Star,
  RefreshCw,
  User,
  Wrench,
  Calendar,
  MessageSquare,
} from 'lucide-react';

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

function StatPill({
  label,
  value,
  icon: Icon,
  variant,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'green' | 'red' | 'gold';
}) {
  const styles = {
    green: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
    },
    red: {
      card: 'border-[#FECACA] bg-white',
      iconWrap: 'border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]',
      label: 'text-[#6B7280]',
      value: 'text-[#EF4444]',
    },
    gold: {
      card: 'border-[#FED7AA] bg-white',
      iconWrap: 'border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]',
      label: 'text-[#6B7280]',
      value: 'text-[#9A3412]',
    },
  }[variant];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-5 ${styles.card}`}
    >
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconWrap}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className={`text-xs font-semibold leading-snug sm:text-sm ${styles.label}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold leading-none sm:text-3xl ${styles.value}`}>{value}</p>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#F3F4F6] text-[#E5E7EB]'
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-[#111827]">{rating}/5</span>
    </div>
  );
}

export const WorkHistoryPanel: React.FC = () => {
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      const completedBookings = (data.bookings || []).filter((b: Booking) =>
        ['COMPLETED', 'CANCELLED', 'AUTO_CANCELLED'].includes(b.status)
      );

      const history = completedBookings.map((booking: Booking) => ({
        id: booking.id,
        date: booking.scheduledEnd || booking.scheduledStart,
        customer: booking.seeker
          ? `${booking.seeker.firstName} ${booking.seeker.lastName}`
          : 'Unknown',
        service: booking.service?.name || 'Service',
        rating: booking.review?.rating || 0,
        status: (booking.status === 'AUTO_CANCELLED'
          ? 'CANCELLED'
          : booking.status) as WorkHistoryItem['status'],
        reviewComment: booking.review?.comment,
      }));

      setWorkHistory(history);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkHistory();
  }, [fetchWorkHistory]);

  const summary = useMemo(() => {
    const completed = workHistory.filter((w) => w.status === 'COMPLETED').length;
    const cancelled = workHistory.filter((w) => w.status === 'CANCELLED').length;
    const rated = workHistory.filter((w) => w.rating > 0);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((sum, w) => sum + w.rating, 0) / rated.length).toFixed(1)
        : '—';

    return { completed, cancelled, avgRating };
  }, [workHistory]);

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <History className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1E3A5F] sm:text-2xl">Work History</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Past completed and cancelled jobs with customer ratings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchWorkHistory}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-all hover:border-[#10B981]/30 hover:bg-[#F5F7F8] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#10B981] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
          <p className="text-sm text-[#6B7280]">Loading work history…</p>
        </div>
      ) : workHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-[#059669]">
            <History className="h-7 w-7" />
          </div>
          <p className="font-semibold text-[#1E3A5F]">No work history yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Complete bookings to build your history and collect reviews.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 min-[400px]:[&>*:nth-child(3)]:col-span-2 sm:gap-4 lg:grid-cols-3 lg:[&>*:nth-child(3)]:col-span-1">
            <StatPill
              label="Completed jobs"
              value={summary.completed}
              icon={CheckCircle2}
              variant="green"
            />
            <StatPill label="Cancelled" value={summary.cancelled} icon={XCircle} variant="red" />
            <StatPill
              label="Average rating"
              value={summary.avgRating === '—' ? '—' : `${summary.avgRating}/5`}
              icon={Star}
              variant="gold"
            />
          </div>

          {/* Job list */}
          <div className="space-y-3 sm:space-y-4">
            {workHistory.map((job, index) => {
              const isCompleted = job.status === 'COMPLETED';

              return (
                <motion.article
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isCompleted
                              ? 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]'
                              : 'border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {job.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(job.date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                            <User className="h-4 w-4 text-[#10B981]" />
                          </div>
                          <p className="truncate font-semibold text-[#111827]">{job.customer}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                            <Wrench className="h-4 w-4 text-[#10B981]" />
                          </div>
                          <p className="truncate text-sm text-[#6B7280]">{job.service}</p>
                        </div>
                      </div>

                      {job.rating > 0 && (
                        <div className="rounded-xl border border-[#FED7AA] bg-[#FFFBEB] px-3 py-2.5">
                          <StarRating rating={job.rating} />
                        </div>
                      )}

                      {job.reviewComment && (
                        <div className="flex gap-2 rounded-xl border border-[#E5E7EB] border-l-4 border-l-[#10B981] bg-[#F9FAFB] px-3 py-2.5">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                          <p className="text-sm italic leading-relaxed text-[#6B7280]">
                            &ldquo;{job.reviewComment}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
