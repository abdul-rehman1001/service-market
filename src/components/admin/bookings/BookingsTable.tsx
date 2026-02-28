"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2, ChevronLeft, ChevronRight, Eye, XCircle,
} from "lucide-react";
import type { AdminBooking, Pagination } from "@/app/admin/bookings/page";

interface BookingsTableProps {
  bookings: AdminBooking[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onCancel: (bookingId: string, reason: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  HOLD: "bg-slate-100 text-slate-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  EN_ROUTE: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  AUTO_CANCELLED: "bg-orange-100 text-orange-700",
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

export default function BookingsTable({
  bookings,
  loading,
  pagination,
  onPageChange,
  onCancel,
}: BookingsTableProps) {
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancelSubmit = async () => {
    if (!cancelModal || !cancelReason.trim()) return;
    setActionLoading(true);
    await onCancel(cancelModal, cancelReason.trim());
    setCancelModal(null);
    setCancelReason("");
    setActionLoading(false);
  };

  const isCancellable = (status: string) =>
    !["COMPLETED", "CANCELLED", "AUTO_CANCELLED"].includes(status);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading bookings...</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
        No bookings found matching your filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="px-4 py-3 text-left">Booking #</th>
              <th className="px-4 py-3 text-left">Service</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Provider</th>
              <th className="px-4 py-3 text-left">Scheduled</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{b.bookingNumber}</td>
                <td className="px-4 py-3 font-medium max-w-[180px] truncate" title={b.service.name}>
                  {b.service.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {b.seeker.profileImage ? (
                      <img src={b.seeker.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] font-semibold">
                        {b.seeker.firstName[0]}{b.seeker.lastName[0]}
                      </div>
                    )}
                    <span>{b.seeker.firstName} {b.seeker.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {b.provider.user.profileImage ? (
                      <img src={b.provider.user.profileImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-semibold">
                        {b.provider.user.firstName[0]}{b.provider.user.lastName[0]}
                      </div>
                    )}
                    <span>{b.provider.businessName || `${b.provider.user.firstName} ${b.provider.user.lastName}`}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(b.scheduledStart).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                  <br />
                  <span className="text-slate-400">
                    {new Date(b.scheduledStart).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                    {" – "}
                    {new Date(b.scheduledEnd).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                    {b.service.category.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}>
                    {formatStatus(b.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition"
                      title="View details"
                    >
                      <Eye size={16} />
                    </Link>
                    {isCancellable(b.status) && (
                      <button
                        onClick={() => setCancelModal(b.id)}
                        className="p-1.5 rounded hover:bg-red-100 text-red-600 transition"
                        title="Cancel booking"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
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
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bookings
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

      {/* Cancel booking modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Cancel Booking</h3>
            <p className="text-sm text-slate-600">
              Please provide a reason for cancelling this booking. This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setCancelModal(null); setCancelReason(""); }}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim() || actionLoading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
