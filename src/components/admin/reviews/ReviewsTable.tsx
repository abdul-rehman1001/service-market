"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2, ChevronLeft, ChevronRight, Eye, Trash2, Star,
} from "lucide-react";
import type { AdminReview, Pagination } from "@/app/admin/reviews/page";

interface ReviewsTableProps {
  reviews: AdminReview[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onDelete: (reviewId: string) => Promise<void>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}
        />
      ))}
    </div>
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
      <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading reviews...</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
        No reviews found matching your filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Reviewer</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left">Comment</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium max-w-[160px] truncate" title={r.booking.service.name}>
                      {r.booking.service.name}
                    </p>
                    <p className="text-xs text-slate-400">{r.booking.service.category.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.reviewer.profileImage ? (
                      <img src={r.reviewer.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] font-semibold">
                        {r.reviewer.firstName[0]}{r.reviewer.lastName[0]}
                      </div>
                    )}
                    <span>{r.reviewer.firstName} {r.reviewer.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.reviewee.profileImage ? (
                      <img src={r.reviewee.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-semibold">
                        {r.reviewee.firstName[0]}{r.reviewee.lastName[0]}
                      </div>
                    )}
                    <span>{r.reviewee.firstName} {r.reviewee.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Stars rating={r.rating} />
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  {r.comment ? (
                    <p className="truncate text-slate-600" title={r.comment}>{r.comment}</p>
                  ) : (
                    <span className="text-slate-400 italic text-xs">No comment</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/reviews/${r.id}`}
                      className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition"
                      title="View details"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => setConfirmDeleteId(r.id)}
                      className="p-1.5 rounded hover:bg-red-100 text-red-600 transition"
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          Showing {(pagination.page - 1) * pagination.limit + 1}–
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1.5 rounded border hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2">Page {pagination.page} of {pagination.totalPages}</span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-1.5 rounded border hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Delete Review</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this review? The provider&apos;s average rating will be recalculated. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
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
