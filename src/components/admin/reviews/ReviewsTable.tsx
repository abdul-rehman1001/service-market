"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Star,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import type { AdminReview, Pagination } from "@/app/admin/reviews/page";

interface ReviewsTableProps {
  reviews: AdminReview[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onDelete: (reviewId: string) => Promise<void>;
}

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#FED7AA] bg-[#FFFBEB] px-2 py-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#E5E7EB]"
            }
          />
        ))}
      </div>
      <span className="ml-0.5 text-xs font-bold text-[#B45309]">{rating}/5</span>
    </div>
  );
}

function PersonAvatar({
  image,
  firstName,
  lastName,
  variant = "reviewer",
}: {
  image: string | null;
  firstName: string;
  lastName: string;
  variant?: "reviewer" | "provider";
}) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="h-8 w-8 shrink-0 rounded-xl object-cover ring-2 ring-[#E5E7EB]"
      />
    );
  }
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white shadow-sm ${
        variant === "provider"
          ? "bg-gradient-to-br from-[#1E3A5F] to-[#2563EB]"
          : "bg-gradient-to-br from-[#1E3A5F] to-[#10B981]"
      }`}
    >
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}

function ReviewActions({
  reviewId,
  onDeleteClick,
  compact = false,
}: {
  reviewId: string;
  onDeleteClick: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/reviews/${reviewId}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
          title="View details"
        >
          <Eye size={16} />
        </Link>
        <button
          type="button"
          onClick={onDeleteClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2]"
          title="Delete review"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/reviews/${reviewId}`}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 sm:flex-none"
      >
        <Eye size={14} />
        View
      </Link>
      <button
        type="button"
        onClick={onDeleteClick}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all hover:bg-[#FEE2E2] sm:flex-none"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

function ReviewRow({
  review,
  index,
  onDeleteClick,
}: {
  review: AdminReview;
  index: number;
  onDeleteClick: () => void;
}) {
  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <p
          className="max-w-[160px] truncate font-semibold text-[#111827]"
          title={review.booking.service.name}
        >
          {review.booking.service.name}
        </p>
        <span className="mt-1 inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#1E3A5F]">
          {review.booking.service.category.name}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={review.reviewer.profileImage}
            firstName={review.reviewer.firstName}
            lastName={review.reviewer.lastName}
            variant="reviewer"
          />
          <span className="text-sm text-[#374151]">
            {review.reviewer.firstName} {review.reviewer.lastName}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={review.reviewee.profileImage}
            firstName={review.reviewee.firstName}
            lastName={review.reviewee.lastName}
            variant="provider"
          />
          <span className="text-sm text-[#374151]">
            {review.reviewee.firstName} {review.reviewee.lastName}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <Stars rating={review.rating} />
      </td>
      <td className="max-w-[220px] px-5 py-4">
        {review.comment ? (
          <p
            className="line-clamp-2 text-sm text-[#6B7280]"
            title={review.comment}
          >
            {review.comment}
          </p>
        ) : (
          <span className="text-xs text-[#9CA3AF]">No comment</span>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6B7280]">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-4">
        <ReviewActions reviewId={review.id} onDeleteClick={onDeleteClick} compact />
      </td>
    </tr>
  );
}

function ReviewCard({
  review,
  index,
  onDeleteClick,
}: {
  review: AdminReview;
  index: number;
  onDeleteClick: () => void;
}) {
  return (
    <article
      className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#111827]">{review.booking.service.name}</p>
          <span className="mt-1 inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-medium text-[#1E3A5F]">
            {review.booking.service.category.name}
          </span>
        </div>
        <Stars rating={review.rating} size={12} />
      </div>

      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={review.reviewer.profileImage}
            firstName={review.reviewer.firstName}
            lastName={review.reviewer.lastName}
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Reviewer
            </p>
            <p className="text-sm text-[#111827]">
              {review.reviewer.firstName} {review.reviewer.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={review.reviewee.profileImage}
            firstName={review.reviewee.firstName}
            lastName={review.reviewee.lastName}
            variant="provider"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Provider
            </p>
            <p className="text-sm text-[#111827]">
              {review.reviewee.firstName} {review.reviewee.lastName}
            </p>
          </div>
        </div>
      </div>

      {review.comment ? (
        <div className="mt-3 flex gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
          <MessageSquare size={14} className="mt-0.5 shrink-0 text-[#059669]" />
          <p className="line-clamp-3 text-sm text-[#6B7280]">{review.comment}</p>
        </div>
      ) : (
        <p className="mt-3 text-xs text-[#9CA3AF]">No comment</p>
      )}

      <p className="mt-2 text-[11px] text-[#9CA3AF]">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <ReviewActions reviewId={review.id} onDeleteClick={onDeleteClick} />
      </div>
    </article>
  );
}

export default function ReviewsTable({
  reviews,
  loading,
  pagination,
  onPageChange,
  onDelete,
}: ReviewsTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setActionLoading(true);
    await onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-16 shadow-sm">
        <Loader2 className="animate-spin text-[#10B981]" size={36} />
        <p className="text-sm font-medium text-[#6B7280]">Loading reviews…</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
          <Star size={28} />
        </div>
        <p className="font-semibold text-[#1E3A5F]">No reviews found</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
        <p className="text-sm text-[#6B7280]">
          Showing{" "}
          <span className="font-bold text-[#111827]">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-bold text-[#111827]">{pagination.total}</span> reviews
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      <div className="animate-admin-scale-in hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Service
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Reviewer
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Provider
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Rating
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Comment
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Date
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, index) => (
                <ReviewRow
                  key={r.id}
                  review={r}
                  index={index}
                  onDeleteClick={() => setConfirmDeleteId(r.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {reviews.map((r, index) => (
          <ReviewCard
            key={r.id}
            review={r}
            index={index}
            onDeleteClick={() => setConfirmDeleteId(r.id)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="text-center text-sm text-[#6B7280] sm:text-left">
          Page{" "}
          <span className="font-bold text-[#111827]">{pagination.page}</span> of{" "}
          <span className="font-bold text-[#111827]">{pagination.totalPages}</span>
        </span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/50 p-0 backdrop-blur-sm animate-admin-fade-in-up sm:items-center sm:p-4">
          <div
            className="w-full max-w-sm animate-admin-scale-in space-y-4 rounded-t-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <h3 id="delete-review-title" className="text-lg font-bold text-[#1E3A5F]">
                Delete Review
              </h3>
            </div>
            <p className="text-sm text-[#6B7280]">
              Are you sure you want to permanently delete this review? The provider&apos;s average
              rating will be recalculated. This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
