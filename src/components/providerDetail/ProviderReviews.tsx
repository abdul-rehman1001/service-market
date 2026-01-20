import React from 'react';
import ReviewCard from './ReviewCard';
import { Review } from '@/types/provider';

interface Props {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

export default function ProviderReviews({ reviews, totalReviews, averageRating }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
            <p className="text-sm text-gray-600">Based on {totalReviews} reviews</p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-2xl font-bold">{averageRating}</span>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
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
    </div>
  );
}
