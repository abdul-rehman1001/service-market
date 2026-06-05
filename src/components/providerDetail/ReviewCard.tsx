'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ReviewType } from '@/types/provider';
import StarRating from './StarRating';
import { Award } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  review: ReviewType;
  index?: number;
}

export default function ReviewCard({ review, index = 0 }: Props) {
  const reduceMotion = useReducedMotion();

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const fullName = `${review.reviewer.firstName} ${review.reviewer.lastName}`;
  const hasSubRatings =
    review.professionalism ||
    review.punctuality ||
    review.qualityOfWork ||
    review.communication ||
    review.valueForMoney;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className="rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_32px_rgba(16,185,129,0.08)] sm:p-6"
    >
      <div className="flex items-start gap-4">
        {review.reviewer.profileImage ? (
          <Image
            src={review.reviewer.profileImage}
            alt={fullName}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-2 ring-[#E2E8F0]"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] text-sm font-bold text-white ring-2 ring-[#E2E8F0]">
            {review.reviewer.firstName.charAt(0)}
            {review.reviewer.lastName.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="font-bold text-[#0F172A]">{fullName}</span>
              <div className="mt-1">
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-[#64748B]">
              {formatDate(review.createdAt)}
            </span>
          </div>

          {review.comment && (
            <p className="text-sm leading-relaxed text-[#64748B]">{review.comment}</p>
          )}

          {hasSubRatings && (
            <div className="mt-4 border-t border-[#E2E8F0]/80 pt-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                <Award className="h-3.5 w-3.5 text-[#10B981]" />
                Detailed ratings
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {review.professionalism && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2">
                    <span className="text-[#64748B]">Professionalism</span>
                    <span className="font-bold text-amber-600">
                      {review.professionalism}/5
                    </span>
                  </div>
                )}
                {review.punctuality && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2">
                    <span className="text-[#64748B]">Punctuality</span>
                    <span className="font-bold text-amber-600">
                      {review.punctuality}/5
                    </span>
                  </div>
                )}
                {review.qualityOfWork && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2">
                    <span className="text-[#64748B]">Quality</span>
                    <span className="font-bold text-amber-600">
                      {review.qualityOfWork}/5
                    </span>
                  </div>
                )}
                {review.communication && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2">
                    <span className="text-[#64748B]">Communication</span>
                    <span className="font-bold text-amber-600">
                      {review.communication}/5
                    </span>
                  </div>
                )}
                {review.valueForMoney && (
                  <div className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3 py-2">
                    <span className="text-[#64748B]">Value</span>
                    <span className="font-bold text-amber-600">
                      {review.valueForMoney}/5
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
