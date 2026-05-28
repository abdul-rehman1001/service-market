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
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--admin-beige)]"
          }
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-[var(--admin-green-dark)]">
        {rating}/5
      </span>
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
        className="h-8 w-8 shrink-0 rounded-lg object-cover ring-2 ring-[var(--admin-beige)]/80"
      />
    );
  }
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white ${
        variant === "provider"
          ? "bg-gradient-to-br from-blue-500 to-blue-700"
          : "bg-gradient-to-br from-[var(--admin-green)] to-[var(--admin-green-dark)]"
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
}: {
  reviewId: string;
  onDeleteClick: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/admin/reviews/${reviewId}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] hover:shadow-sm"
        title="View details"
      >
        <Eye size={16} />
      </Link>
      <button
        type="button"
        onClick={onDeleteClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100"
        title="Delete review"
      >
        <Trash2 size={16} />
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
      className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <p
          className="max-w-[160px] truncate font-semibold text-[var(--admin-green-dark)]"
          title={review.booking.service.name}
        >
          {review.booking.service.name}
        </p>
        <p className="text-xs text-[var(--admin-green)]/60">
          {review.booking.service.category.name}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={review.reviewer.profileImage}
            firstName={review.reviewer.firstName}
            lastName={review.reviewer.lastName}
            variant="reviewer"
          />
          <span className="text-sm text-[var(--admin-green-dark)]">
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
          <span className="text-sm text-[var(--admin-green-dark)]">
            {review.reviewee.firstName} {review.reviewee.lastName}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <Stars rating={review.rating} />
      </td>
      <td className="max-w-[220px] px-5 py-4">
        {review.comment ? (
          <p className="line-clamp-2 text-sm text-[var(--admin-green-dark)]/75" title={review.comment}>
            {review.comment}
          </p>
        ) : (
          <span className="text-xs italic text-[var(--admin-green)]/45">No comment</span>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--admin-green)]/70">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-4">
        <ReviewActions reviewId={review.id} onDeleteClick={onDeleteClick} />
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
      className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--admin-green-dark)]">{review.booking.service.name}</p>
          <p className="text-xs text-[var(--admin-green)]/60">
            {review.booking.service.category.name}
          </p>
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
            <p className="text-[10px] font-medium uppercase text-[var(--admin-green)]/50">Reviewer</p>
            <p className="text-sm text-[var(--admin-green-dark)]">
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
            <p className="text-[10px] font-medium uppercase text-[var(--admin-green)]/50">Provider</p>
            <p className="text-sm text-[var(--admin-green-dark)]">
              {review.reviewee.firstName} {review.reviewee.lastName}
            </p>
          </div>
        </div>
      </div>

      {review.comment ? (
        <div className="mt-3 flex gap-2 rounded-xl bg-[var(--admin-green-muted)]/50 p-3">
          <MessageSquare size={14} className="mt-0.5 shrink-0 text-[var(--admin-green)]" />
          <p className="line-clamp-3 text-sm text-[var(--admin-green-dark)]/80">{review.comment}</p>
        </div>
      ) : (
        <p className="mt-3 text-xs italic text-[var(--admin-green)]/45">No comment</p>
      )}

      <p className="mt-2 text-[11px] text-[var(--admin-green)]/55">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
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
      <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading reviews…</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
          <Star size={32} />
        </div>
        <p className="font-semibold text-[var(--admin-green-dark)]">No reviews found</p>
        <p className="mt-1 text-sm text-[var(--admin-green)]/60">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="admin-card animate-admin-scale-in hidden overflow-hidden rounded-2xl md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)] to-[var(--admin-beige)]/20">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Service
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Reviewer
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Provider
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Rating
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Comment
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Date
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
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

      <div className="admin-card animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="text-center text-sm text-[var(--admin-green)]/75 sm:text-left">
          Showing{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">{pagination.total}</span>{" "}
          reviews
        </span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[7rem] text-center text-sm font-medium text-[var(--admin-green-dark)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-green-dark)]/50 p-4 backdrop-blur-sm animate-admin-fade-in-up">
          <div
            className="admin-card w-full max-w-sm animate-admin-scale-in space-y-4 rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
          >
            <h3 id="delete-review-title" className="text-lg font-bold text-red-600">
              Delete Review
            </h3>
            <p className="text-sm text-[var(--admin-green-dark)]/75">
              Are you sure you want to permanently delete this review? The provider&apos;s average
              rating will be recalculated. This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-[var(--admin-beige)] px-4 py-2.5 text-sm font-medium text-[var(--admin-green-dark)] transition-colors hover:bg-[var(--admin-green-muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
