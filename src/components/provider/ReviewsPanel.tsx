'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2,
  AlertCircle,
  Star,
  RefreshCw,
  MessageSquare,
  Users,
  Calendar,
  Wrench,
} from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  professionalism?: number;
  punctuality?: number;
  qualityOfWork?: number;
  communication?: number;
  valueForMoney?: number;
  createdAt: string;
  serviceName?: string;
  reviewer?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const starClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starClass} ${
            i < rating ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-[#F3F4F6] text-[#E5E7EB]'
          }`}
        />
      ))}
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  children,
  variant = 'green',
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  variant?: 'green' | 'gold';
}) {
  const styles = {
    green: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
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
        <p className={`text-xs font-semibold sm:text-sm ${styles.label}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold sm:text-3xl ${styles.value}`}>{value}</p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

const DETAIL_LABELS: { key: keyof Review; label: string }[] = [
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'qualityOfWork', label: 'Quality' },
  { key: 'communication', label: 'Communication' },
  { key: 'valueForMoney', label: 'Value' },
];

export const ReviewsPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/providers/${id}/reviews?limit=50`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      const formattedReviews = (data.reviews || []).map(
        (review: {
          id: string;
          rating: number;
          comment: string;
          professionalism?: number;
          punctuality?: number;
          qualityOfWork?: number;
          communication?: number;
          valueForMoney?: number;
          createdAt: string;
          serviceName?: string;
          reviewer?: Review['reviewer'];
        }) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          professionalism: review.professionalism,
          punctuality: review.punctuality,
          qualityOfWork: review.qualityOfWork,
          communication: review.communication,
          valueForMoney: review.valueForMoney,
          createdAt: review.createdAt,
          serviceName: review.serviceName,
          customerName: review.reviewer
            ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
            : 'Anonymous',
          reviewer: review.reviewer,
        })
      );

      setReviews(formattedReviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/provider/dashboard');
      const data = await res.json();
      if (data.provider?.id) {
        await fetchReviews(data.provider.id);
      } else {
        setError('Failed to load provider information');
        setLoading(false);
      }
    } catch {
      setError('Failed to load provider information');
      setLoading(false);
    }
  }, [fetchReviews]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    if (reviews.length === 0) return { count: 0, average: 0 };
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { count: reviews.length, average: Math.round(average * 10) / 10 };
  }, [reviews]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]">
            <Star className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1E3A5F] sm:text-2xl">Customer Reviews</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Feedback and ratings from your completed jobs
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadData}
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
          <p className="text-sm text-[#6B7280]">Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]">
            <Star className="h-7 w-7" />
          </div>
          <p className="font-semibold text-[#1E3A5F]">No reviews yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Complete jobs and deliver great service to start collecting reviews.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <StatPill label="Total reviews" value={summary.count} icon={Users} variant="green" />
            <StatPill label="Average rating" value={`${summary.average}/5`} icon={Star} variant="gold">
              <StarRating rating={Math.round(summary.average)} size="sm" />
            </StatPill>
          </div>

          {/* Review list */}
          <ul className="space-y-3 sm:space-y-4">
            {reviews.map((review, index) => {
              const detailScores = DETAIL_LABELS.filter(
                (d) => typeof review[d.key] === 'number' && (review[d.key] as number) > 0
              );

              return (
                <motion.li
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="list-none"
                >
                  <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
                    <div className="p-4 sm:p-5">
                      {/* Top row */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          {review.reviewer?.profileImage ? (
                            <img
                              src={review.reviewer.profileImage}
                              alt={review.customerName}
                              className="h-11 w-11 shrink-0 rounded-xl border-2 border-[#E5E7EB] object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F] text-sm font-bold text-white">
                              {getInitials(review.customerName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#111827]">
                              {review.customerName}
                            </p>
                            {review.serviceName && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#6B7280]">
                                <Wrench className="h-3 w-3 shrink-0 text-[#10B981]" />
                                {review.serviceName}
                              </p>
                            )}
                            <p className="mt-1 flex items-center gap-1 text-xs text-[#6B7280]">
                              <Calendar className="h-3 w-3 shrink-0" />
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                          <StarRating rating={review.rating} />
                          <span className="rounded-full border border-[#FED7AA] bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#B45309]">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      {review.comment?.trim() && (
                        <div className="mt-4 flex gap-2.5 rounded-xl border border-[#E5E7EB] border-l-4 border-l-[#10B981] bg-[#F9FAFB] px-3 py-3">
                          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                          <p className="text-sm leading-relaxed text-[#374151]">
                            {review.comment}
                          </p>
                        </div>
                      )}

                      {/* Detail scores */}
                      {detailScores.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#E5E7EB] pt-4 sm:grid-cols-3 lg:grid-cols-5">
                          {detailScores.map(({ key, label }) => (
                            <div
                              key={key}
                              className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-2 text-center transition-colors hover:border-[#10B981]/25"
                            >
                              <p className="text-[10px] font-medium leading-tight text-[#6B7280] sm:text-xs">
                                {label}
                              </p>
                              <p className="mt-0.5 text-sm font-bold text-[#111827]">
                                {review[key] as number}/5
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
};
