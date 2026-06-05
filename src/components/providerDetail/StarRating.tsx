import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showRating?: boolean;
  reviewCount?: number;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export default function StarRating({
  rating,
  size = 'md',
  showRating = false,
  reviewCount,
}: Props) {
  const iconClass = sizeClasses[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${iconClass} ${
              i < Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-[#E2E8F0]'
            }`}
          />
        ))}
      </div>
      {showRating && (
        <>
          <span className="text-sm font-semibold text-[#0F172A]">
            {rating.toFixed(1)}
          </span>
          {reviewCount !== undefined && (
            <span className="text-sm text-[#64748B]">({reviewCount})</span>
          )}
        </>
      )}
    </div>
  );
}
