import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, size = 'md', showRating = false, reviewCount }: Props) {
  const sizeMap = { sm: 3, md: 4, lg: 5 };
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-${sizeMap[size]} h-${sizeMap[size]} ${
        i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
      }`}
    />
  ));

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">{stars}</div>
      {showRating && (
        <>
          <span className="text-sm font-medium">{rating}</span>
          {reviewCount && <span className="text-gray-500 text-sm">({reviewCount})</span>}
        </>
      )}
    </div>
  );
}
