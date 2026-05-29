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
      card: 'border-[#6FCF97]/40 bg-gradient-to-br from-white to-[#6FCF97]/12',
      icon: 'bg-[#2FA084] text-white',
      label: 'text-[#1F6F5F]/70',
      value: 'text-[#1F6F5F]',
    },
    red: {
      card: 'border-red-200/80 bg-gradient-to-br from-red-50/80 to-white',
      icon: 'bg-red-500 text-white',
      label: 'text-red-800/70',
      value: 'text-red-900',
    },
    gold: {
      card: 'border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-white',
      icon: 'bg-amber-500 text-white',
      label: 'text-amber-800/70',
      value: 'text-amber-900',
    },
  }[variant];

  return (
    <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${styles.card}`}>
      <div className="mb-2.5 flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}
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
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-[#EEEEEE] text-[#6FCF97]/50'
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-[#1F6F5F]">{rating}/5</span>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">Work History</h2>
          <p className="mt-1 text-sm text-[#1F6F5F]/65">
            Past completed and cancelled jobs with customer ratings
          </p>
        </div>
        <button
          type="button"
          onClick={fetchWorkHistory}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#6FCF97]/50 bg-white px-3.5 py-2 text-sm font-semibold text-[#1F6F5F] shadow-sm transition hover:border-[#2FA084] hover:bg-[#EEEEEE] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
          <p className="text-sm text-[#1F6F5F]/65">Loading work history…</p>
        </div>
      ) : workHistory.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#6FCF97]/50 bg-[#EEEEEE]/60 px-6 py-14 text-center">
          <History className="mx-auto mb-3 h-10 w-10 text-[#6FCF97]" />
          <p className="font-semibold text-[#1F6F5F]">No work history yet</p>
          <p className="mt-1 text-sm text-[#1F6F5F]/60">
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
                  className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-[0_6px_24px_-16px_rgba(31,111,95,0.5)]"
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-5">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isCompleted
                              ? 'bg-[#6FCF97]/25 text-[#1F6F5F]'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {job.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-[#1F6F5F]/60">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(job.date), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEEEE]">
                            <User className="h-4 w-4 text-[#2FA084]" />
                          </div>
                          <p className="truncate font-semibold text-[#1F6F5F]">{job.customer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEEEEE]">
                            <Wrench className="h-4 w-4 text-[#2FA084]" />
                          </div>
                          <p className="truncate text-sm text-[#1F6F5F]/75">{job.service}</p>
                        </div>
                      </div>

                      {job.rating > 0 && (
                        <div className="rounded-xl border border-[#6FCF97]/30 bg-[#EEEEEE]/60 px-3 py-2.5">
                          <StarRating rating={job.rating} />
                        </div>
                      )}

                      {job.reviewComment && (
                        <div className="flex gap-2 rounded-xl border-l-4 border-[#2FA084] bg-[#EEEEEE]/80 px-3 py-2.5">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#2FA084]" />
                          <p className="text-sm italic leading-relaxed text-[#1F6F5F]/80">
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
