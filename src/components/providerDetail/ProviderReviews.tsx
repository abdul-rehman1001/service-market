import React from 'react';
import ReviewCard from './ReviewCard';
import { ReviewType } from '@/types/provider';
import { Star, MessageSquare } from 'lucide-react';

interface Props {
  reviews: ReviewType[];
  totalReviews: number;
  averageRating: number;
}

export default function ProviderReviews({ reviews, totalReviews, averageRating }: Props) {
  if (totalReviews === 0) {
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
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length === 0 && totalReviews > 0 && (
        <p className="text-center text-gray-500 text-sm py-4">
          No detailed reviews available to display.
        </p>
      )}
    </div>
  );
}
