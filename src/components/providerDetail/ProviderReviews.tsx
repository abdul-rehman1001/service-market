'use client';

import React, { useEffect, useState } from 'react';
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

export default function ProviderReviews({ 
  providerId,
  initialReviews = [],
  initialTotalReviews = 0,
  initialAverageRating = 0
}: Props) {
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
      
      const response = await fetch(`/api/providers/${providerId}/reviews?page=${pageNum}&limit=10`);
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
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Failed to Load Reviews</h3>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => fetchReviews(1)}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (totalReviews === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 text-sm">This provider hasn't received any reviews yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-6 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Customer Reviews</h3>
            <p className="text-sm text-gray-600">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>
          <div className="flex flex-col items-center gap-2 mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-slate-500 text-sm">Loading reviews...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </button>
            </div>
          )}

          {reviews.length === 0 && totalReviews > 0 && !loading && (
            <p className="text-center text-gray-500 text-sm py-4">
              No detailed reviews available to display.
            </p>
          )}
        </>
      )}
    </div>
  );
}
