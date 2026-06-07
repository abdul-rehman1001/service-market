"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Calendar,
  MapPin,
  AlertCircle,
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
  HOLD: "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]",
  PENDING: "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]",
  CONFIRMED: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]",
  EN_ROUTE: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]",
  IN_PROGRESS: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]",
  COMPLETED: "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]",
  CANCELLED: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  AUTO_CANCELLED: "border-[#FED7AA] bg-[#FFEDD5] text-[#C2410C]",
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

const isCancellable = (status: string) =>
  !["COMPLETED", "CANCELLED", "AUTO_CANCELLED"].includes(status);

function PersonAvatar({
  image,
  firstName,
  lastName,
  variant = "seeker",
}: {
  image: string | null;
  firstName: string;
  lastName: string;
  variant?: "seeker" | "provider";
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

function BookingActions({
  booking,
  onCancelClick,
  compact = false,
}: {
  booking: AdminBooking;
  onCancelClick: () => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
          title="View details"
        >
          <Eye size={16} />
        </Link>
        {isCancellable(booking.status) && (
          <button
            type="button"
            onClick={onCancelClick}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2]"
            title="Cancel booking"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 sm:flex-none"
      >
        <Eye size={14} />
        View
      </Link>
      {isCancellable(booking.status) && (
        <button
          type="button"
          onClick={onCancelClick}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all hover:bg-[#FEE2E2] sm:flex-none"
        >
          <XCircle size={14} />
          Cancel
        </button>
      )}
    </div>
  );
}

function BookingSchedule({ booking }: { booking: AdminBooking }) {
  const start = new Date(booking.scheduledStart);
  const end = new Date(booking.scheduledEnd);
  return (
    <div className="text-xs">
      <p className="font-semibold text-[#111827]">
        {start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <p className="text-[#6B7280]">
        {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        {" – "}
        {end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}

function BookingRow({
  booking,
  index,
  onCancelClick,
}: {
  booking: AdminBooking;
  index: number;
  onCancelClick: () => void;
}) {
  const providerName =
    booking.provider.businessName ||
    `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <span className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 font-mono text-xs font-bold text-[#1E3A5F]">
          {booking.bookingNumber}
        </span>
      </td>
      <td className="max-w-[160px] px-5 py-4">
        <p
          className="truncate font-semibold text-[#111827]"
          title={booking.service.name}
        >
          {booking.service.name}
        </p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={booking.seeker.profileImage}
            firstName={booking.seeker.firstName}
            lastName={booking.seeker.lastName}
            variant="seeker"
          />
          <span className="text-sm text-[#374151]">
            {booking.seeker.firstName} {booking.seeker.lastName}
          </span>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={booking.provider.user.profileImage}
            firstName={booking.provider.user.firstName}
            lastName={booking.provider.user.lastName}
            variant="provider"
          />
          <span className="text-sm text-[#374151]">{providerName}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <BookingSchedule booking={booking} />
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1E3A5F]">
          {booking.service.category.name}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
            statusColors[booking.status] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {formatStatus(booking.status)}
        </span>
      </td>
      <td className="px-5 py-4">
        <BookingActions booking={booking} onCancelClick={onCancelClick} compact />
      </td>
    </tr>
  );
}

function BookingCard({
  booking,
  index,
  onCancelClick,
}: {
  booking: AdminBooking;
  index: number;
  onCancelClick: () => void;
}) {
  const providerName =
    booking.provider.businessName ||
    `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

  return (
    <article
      className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-[#059669]">#{booking.bookingNumber}</p>
          <p className="mt-1 font-semibold text-[#111827]">{booking.service.name}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
            statusColors[booking.status] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {formatStatus(booking.status)}
        </span>
      </div>

      <div className="mt-3 space-y-2.5 text-sm">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={booking.seeker.profileImage}
            firstName={booking.seeker.firstName}
            lastName={booking.seeker.lastName}
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Customer
            </p>
            <p className="text-[#111827]">
              {booking.seeker.firstName} {booking.seeker.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={booking.provider.user.profileImage}
            firstName={booking.provider.user.firstName}
            lastName={booking.provider.user.lastName}
            variant="provider"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Provider
            </p>
            <p className="text-[#111827]">{providerName}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-[#6B7280]">
          <Calendar size={14} className="mt-0.5 shrink-0 text-[#059669]" />
          <BookingSchedule booking={booking} />
        </div>
        {booking.location && (
          <div className="flex items-start gap-2 text-xs text-[#6B7280]">
            <MapPin size={14} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
            <span className="line-clamp-2">{booking.location}</span>
          </div>
        )}
        <span className="inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#1E3A5F]">
          {booking.service.category.name}
        </span>
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <BookingActions booking={booking} onCancelClick={onCancelClick} />
      </div>
    </article>
  );
}

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-16 shadow-sm">
        <Loader2 className="animate-spin text-[#10B981]" size={36} />
        <p className="text-sm font-medium text-[#6B7280]">Loading bookings…</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
          <Calendar size={28} />
        </div>
        <p className="font-semibold text-[#1E3A5F]">No bookings found</p>
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
          <span className="font-bold text-[#111827]">{pagination.total}</span> bookings
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
                  Booking #
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Service
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Customer
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Provider
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Scheduled
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Category
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, index) => (
                <BookingRow
                  key={b.id}
                  booking={b}
                  index={index}
                  onCancelClick={() => setCancelModal(b.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {bookings.map((b, index) => (
          <BookingCard
            key={b.id}
            booking={b}
            index={index}
            onCancelClick={() => setCancelModal(b.id)}
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

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/50 p-0 backdrop-blur-sm animate-admin-fade-in-up sm:items-center sm:p-4">
          <div
            className="w-full max-w-md animate-admin-scale-in space-y-4 rounded-t-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <h3 id="cancel-booking-title" className="text-lg font-bold text-[#1E3A5F]">
                Cancel Booking
              </h3>
            </div>
            <p className="text-sm text-[#6B7280]">
              Please provide a reason for cancelling this booking. This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] transition-all focus:border-[#EF4444] focus:outline-none focus:ring-2 focus:ring-[#FECACA]"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                }}
                className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#F3F4F6]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim() || actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] transition-colors hover:bg-[#DC2626] disabled:opacity-50"
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
