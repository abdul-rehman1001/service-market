'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ReviewCard from './ReviewCard';
import { ReviewType } from '@/types/provider';
import { Star, MessageSquare, Loader } from 'lucide-react';

interface Props {
  providerId: string;
  initialReviews?: ReviewType[];
  initialTotalReviews?: number;
  initialAverageRating?: number;
}

interface ReviewResponse {
  error?: string;
  reviews: ReviewType[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    averageRating: number;
    totalReviews: number;
  };
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof MessageSquare;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 px-6 py-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:py-16"
    >
      <div className="mx-auto max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-2 ring-[#10B981]/10">
          <Icon className="h-8 w-8 text-[#10B981]" />
        </div>
        <h3 className="text-lg font-bold text-[#0F172A] sm:text-xl">{title}</h3>
        <p className="mt-2 text-sm text-[#64748B]">{description}</p>
        {action}
      </div>
    </motion.div>
  );
}

export default function ProviderReviews({
  providerId,
  initialReviews = [],
  initialTotalReviews = 0,
  initialAverageRating = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [reviews, setReviews] = useState<ReviewType[]>(initialReviews);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchReviews(1);
  }, [providerId]);

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/providers/${providerId}/reviews?page=${pageNum}&limit=10`
      );
      const data: ReviewResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      if (pageNum === 1) {
        setReviews(data.reviews);
      } else {
        setReviews((prev) => [...prev, ...data.reviews]);
      }

      setTotalReviews(data.summary.totalReviews);
      setAverageRating(data.summary.averageRating);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(page + 1);
    }
  };

  if (error && reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Failed to Load Reviews"
        description={error}
        action={
          <button
            type="button"
            onClick={() => fetchReviews(1)}
            className="mt-5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          >
            Try Again
          </button>
        }
      />
    );
  }

  if (totalReviews === 0 && !loading) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No Reviews Yet"
        description="This provider hasn't received any reviews yet."
      />
    );
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
              Customer Reviews
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
                {averageRating.toFixed(1)}
              </span>
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    i < Math.floor(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-[#E2E8F0]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="h-8 w-8 animate-spin text-[#10B981]" />
            <p className="text-sm text-[#64748B]">Loading reviews...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </button>
            </div>
          )}

          {reviews.length === 0 && totalReviews > 0 && !loading && (
            <p className="py-4 text-center text-sm text-[#64748B]">
              No detailed reviews available to display.
            </p>
          )}
        </>
      )}
    </div>
  );
}
