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
  HOLD: "bg-slate-100 text-slate-700 border border-slate-200",
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200",
  EN_ROUTE: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  IN_PROGRESS: "bg-purple-50 text-purple-700 border border-purple-200",
  COMPLETED:
    "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
  AUTO_CANCELLED: "bg-orange-50 text-orange-800 border border-orange-200",
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

function BookingActions({
  booking,
  onCancelClick,
}: {
  booking: AdminBooking;
  onCancelClick: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] hover:shadow-sm"
        title="View details"
      >
        <Eye size={16} />
      </Link>
      {isCancellable(booking.status) && (
        <button
          type="button"
          onClick={onCancelClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100"
          title="Cancel booking"
        >
          <XCircle size={16} />
        </button>
      )}
    </div>
  );
}

function BookingSchedule({ booking }: { booking: AdminBooking }) {
  const start = new Date(booking.scheduledStart);
  const end = new Date(booking.scheduledEnd);
  return (
    <div className="text-xs text-[var(--admin-green-dark)]/75">
      <p className="font-medium">
        {start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <p className="text-[var(--admin-green)]/55">
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
      className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <span className="font-mono text-xs font-semibold text-[var(--admin-green-dark)]">
          {booking.bookingNumber}
        </span>
      </td>
      <td className="max-w-[160px] px-5 py-4">
        <p className="truncate font-medium text-[var(--admin-green-dark)]" title={booking.service.name}>
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
          <span className="text-sm text-[var(--admin-green-dark)]">
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
          <span className="text-sm text-[var(--admin-green-dark)]">{providerName}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <BookingSchedule booking={booking} />
      </td>
      <td className="px-5 py-4">
        <span className="inline-block rounded-lg bg-[var(--admin-green-muted)] px-2.5 py-1 text-xs font-medium text-[var(--admin-green-dark)]">
          {booking.service.category.name}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}
        >
          {formatStatus(booking.status)}
        </span>
      </td>
      <td className="px-5 py-4">
        <BookingActions booking={booking} onCancelClick={onCancelClick} />
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
      className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-[var(--admin-green)]">
            #{booking.bookingNumber}
          </p>
          <p className="mt-1 font-semibold text-[var(--admin-green-dark)]">{booking.service.name}</p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[booking.status] || ""}`}
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
            <p className="text-[10px] font-medium uppercase text-[var(--admin-green)]/50">Customer</p>
            <p className="text-[var(--admin-green-dark)]">
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
            <p className="text-[10px] font-medium uppercase text-[var(--admin-green)]/50">Provider</p>
            <p className="text-[var(--admin-green-dark)]">{providerName}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-[var(--admin-green)]/70">
          <Calendar size={14} className="mt-0.5 shrink-0" />
          <BookingSchedule booking={booking} />
        </div>
        {booking.location && (
          <div className="flex items-start gap-2 text-xs text-[var(--admin-green)]/70">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2">{booking.location}</span>
          </div>
        )}
        <span className="inline-block rounded-lg bg-[var(--admin-green-muted)] px-2 py-0.5 text-xs font-medium text-[var(--admin-green-dark)]">
          {booking.service.category.name}
        </span>
      </div>

      <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
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
      <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading bookings…</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
          <Calendar size={32} />
        </div>
        <p className="font-semibold text-[var(--admin-green-dark)]">No bookings found</p>
        <p className="mt-1 text-sm text-[var(--admin-green)]/60">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="admin-card animate-admin-scale-in hidden overflow-hidden rounded-2xl md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)] to-[var(--admin-beige)]/20">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Booking #
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Service
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Customer
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Provider
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Scheduled
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Category
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
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

      {/* Mobile cards */}
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

      {/* Pagination */}
      <div className="admin-card animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="text-center text-sm text-[var(--admin-green)]/75 sm:text-left">
          Showing{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">{pagination.total}</span>{" "}
          bookings
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

      {/* Cancel modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-green-dark)]/50 p-4 backdrop-blur-sm animate-admin-fade-in-up">
          <div
            className="admin-card w-full max-w-md animate-admin-scale-in space-y-4 rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
          >
            <h3 id="cancel-booking-title" className="text-lg font-bold text-red-600">
              Cancel Booking
            </h3>
            <p className="text-sm text-[var(--admin-green-dark)]/75">
              Please provide a reason for cancelling this booking. This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--admin-beige)] bg-white px-4 py-3 text-sm text-[var(--admin-green-dark)] transition-all focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setCancelModal(null);
                  setCancelReason("");
                }}
                className="rounded-xl border border-[var(--admin-beige)] px-4 py-2.5 text-sm font-medium text-[var(--admin-green-dark)] transition-colors hover:bg-[var(--admin-green-muted)]"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim() || actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
