import React from 'react';
import Image from 'next/image';
import { ReviewType } from '@/types/provider';
import StarRating from './StarRating';
import { Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  review: ReviewType;
}

export default function ReviewCard({ review }: Props) {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const fullName = `${review.reviewer.firstName} ${review.reviewer.lastName}`;
  const hasSubRatings = review.professionalism || review.punctuality || 
                        review.qualityOfWork || review.communication || 
                        review.valueForMoney;

  return (
    <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {review.reviewer.profileImage ? (
          <Image
            src={review.reviewer.profileImage}
            alt={fullName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-gray-100 flex-shrink-0">
            {review.reviewer.firstName.charAt(0)}
            {review.reviewer.lastName.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{fullName}</span>
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>
            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
          </div>

          {review.comment && (
            <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.comment}</p>
          )}

          {/* Sub-ratings */}
          {hasSubRatings && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                <Award className="w-3.5 h-3.5" />
                <span className="font-medium">Detailed Ratings</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {review.professionalism && (
                  <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Professionalism:</span>
                    <span className="font-medium text-yellow-600">{review.professionalism}/5</span>
                  </div>
                )}
                {review.punctuality && (
                  <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Punctuality:</span>
                    <span className="font-medium text-yellow-600">{review.punctuality}/5</span>
                  </div>
                )}
                {review.qualityOfWork && (
                  <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Quality:</span>
                    <span className="font-medium text-yellow-600">{review.qualityOfWork}/5</span>
                  </div>
                )}
                {review.communication && (
                  <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Communication:</span>
                    <span className="font-medium text-yellow-600">{review.communication}/5</span>
                  </div>
                )}
                {review.valueForMoney && (
                  <div className="flex items-center justify-between bg-gray-50 px-2 py-1.5 rounded">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium text-yellow-600">{review.valueForMoney}/5</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
