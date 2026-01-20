import React from 'react';
import { Review } from '@/types/provider';
import StarRating from './StarRating';

interface Props {
  review: Review;
}

export default function ReviewCard({ review }: Props) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.name}</span>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-xs text-gray-500">{formatDate(review.date)}</span>
          </div>
          <p className="text-gray-700 text-sm">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}
