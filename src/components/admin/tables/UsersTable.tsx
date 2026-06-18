"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Eye,
  Users,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import type { AdminUser, Pagination } from "@/app/admin/users/page";

interface UsersTableProps {
  users: AdminUser[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onStatusChange: (userId: string, status: "ACTIVE" | "SUSPENDED") => void;
  onDelete: (userId: string) => void;
}

const statusBadge: Record<string, string> = {
  ACTIVE: "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]",
  SUSPENDED: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  UNVERIFIED: "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]",
};

const verificationBadge: Record<string, string> = {
  PENDING: "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]",
  APPROVED: "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]",
  REJECTED: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
};

const roleBadge: Record<string, string> = {
  SEEKER: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]",
  PROVIDER: "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]",
};

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt=""
        className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-[#E5E7EB]"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#10B981] text-xs font-bold text-white shadow-sm">
      {user.firstName[0]}
      {user.lastName[0]}
    </div>
  );
}

function UserActions({
  user,
  actionLoading,
  onStatusToggle,
  onDeleteClick,
}: {
  user: AdminUser;
  actionLoading: string | null;
  onStatusToggle: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/admin/users/${user.id}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
        title="View details"
      >
        <Eye size={16} />
      </Link>
      <button
        type="button"
        onClick={onStatusToggle}
        disabled={actionLoading === user.id}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all disabled:opacity-50 ${
          user.status === "SUSPENDED"
            ? "border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] hover:shadow-md"
            : "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
        }`}
        title={user.status === "SUSPENDED" ? "Activate user" : "Suspend user"}
      >
        {actionLoading === user.id ? (
          <Loader2 size={16} className="animate-spin" />
        ) : user.status === "SUSPENDED" ? (
          <ShieldCheck size={16} />
        ) : (
          <ShieldAlert size={16} />
        )}
      </button>
      <button
        type="button"
        onClick={onDeleteClick}
        disabled={actionLoading === user.id}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2] disabled:opacity-50"
        title="Delete user"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function UsersTable({
  users,
  loading,
  pagination,
  onPageChange,
  onStatusChange,
  onDelete,
}: UsersTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoading(user.id);
    await onStatusChange(user.id, newStatus as "ACTIVE" | "SUSPENDED");
    setActionLoading(null);
  };

  const handleDeleteConfirm = async (userId: string) => {
    setActionLoading(userId);
    await onDelete(userId);
    setConfirmDeleteId(null);
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-16 shadow-sm">
        <Loader2 className="animate-spin text-[#10B981]" size={36} />
        <p className="text-sm font-medium text-[#6B7280]">Loading users…</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
          <Users size={28} />
        </div>
        <p className="font-semibold text-[#1E3A5F]">No users found</p>
        <p className="mt-1 text-sm text-[#6B7280]">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="animate-admin-scale-in hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  User
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Phone
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Verification
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Joined
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
                  style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <span className="font-semibold text-[#111827]">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 text-[#6B7280]">{u.email}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{u.phone}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${roleBadge[u.role] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"}`}
                    >
                      {u.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[u.status] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.role === "PROVIDER" && u.providerProfile ? (
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationBadge[u.providerProfile.verificationStatus] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"}`}
                      >
                        {u.providerProfile.verificationStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">N/A</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6B7280]">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <UserActions
                      user={u}
                      actionLoading={actionLoading}
                      onStatusToggle={() => handleStatusToggle(u)}
                      onDeleteClick={() => setConfirmDeleteId(u.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.map((u, index) => (
          <article
            key={u.id}
            className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
            style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <UserAvatar user={u} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#111827]">
                  {u.firstName} {u.lastName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[#6B7280]">
                  <Mail size={12} className="shrink-0 text-[#10B981]" />
                  {u.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6B7280]">
                  <Phone size={12} className="shrink-0 text-[#10B981]" />
                  {u.phone}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${roleBadge[u.role] || ""}`}
              >
                {u.role.toLowerCase()}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge[u.status] || ""}`}
              >
                {u.status}
              </span>
              {u.role === "PROVIDER" && u.providerProfile && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${verificationBadge[u.providerProfile.verificationStatus] || ""}`}
                >
                  {u.providerProfile.verificationStatus}
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-[#9CA3AF]">
              Joined{" "}
              {new Date(u.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            <div className="mt-4 border-t border-[#E5E7EB] pt-3">
              <UserActions
                user={u}
                actionLoading={actionLoading}
                onStatusToggle={() => handleStatusToggle(u)}
                onDeleteClick={() => setConfirmDeleteId(u.id)}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      <div className="animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="text-center text-sm text-[#6B7280] sm:text-left">
          Showing{" "}
          <span className="font-semibold text-[#111827]">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#111827]">{pagination.total}</span> users
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
          <span className="min-w-[7rem] text-center text-sm font-semibold text-[#1E3A5F]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
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

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111827]/50 p-0 backdrop-blur-sm animate-admin-fade-in-up sm:items-center sm:p-4">
          <div
            className="w-full max-w-sm animate-admin-scale-in space-y-4 rounded-t-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-[#FEF2F2]">
                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
              </div>
              <h3 id="delete-user-title" className="text-lg font-bold text-[#1E3A5F]">
                Delete User
              </h3>
            </div>
            <p className="text-sm text-[#6B7280]">
              Are you sure you want to delete this user? This action cannot be undone. Any
              of their active bookings will be cancelled and both parties notified by email.
              Past booking history is preserved for the other parties.
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
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                disabled={actionLoading === confirmDeleteId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(239,68,68,0.3)] transition-colors hover:bg-[#DC2626] disabled:opacity-50"
              >
                {actionLoading === confirmDeleteId && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
