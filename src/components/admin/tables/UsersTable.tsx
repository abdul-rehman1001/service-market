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
  ACTIVE: "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  SUSPENDED: "bg-red-50 text-red-700 border border-red-200",
  UNVERIFIED: "bg-amber-50 text-amber-800 border border-amber-200",
};

const verificationBadge: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200",
  APPROVED: "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
};

const roleBadge: Record<string, string> = {
  SEEKER: "bg-blue-50 text-blue-700 border border-blue-200",
  PROVIDER: "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
};

function UserAvatar({ user }: { user: AdminUser }) {
  if (user.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt=""
        className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-[var(--admin-beige)]/80"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-green)] to-[var(--admin-green-dark)] text-xs font-bold text-white shadow-sm">
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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] hover:shadow-sm"
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
            ? "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green)] hover:shadow-sm"
            : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
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
      <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading users…</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
          <Users size={32} />
        </div>
        <p className="font-semibold text-[var(--admin-green-dark)]">No users found</p>
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
                  User
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Phone
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Verification
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Joined
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
                  style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={u} />
                      <span className="font-semibold text-[var(--admin-green-dark)]">
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-5 py-4 text-[var(--admin-green-dark)]/75">
                    {u.email}
                  </td>
                  <td className="px-5 py-4 text-[var(--admin-green-dark)]/75">{u.phone}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${roleBadge[u.role] || "bg-gray-100 text-gray-700"}`}
                    >
                      {u.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadge[u.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.role === "PROVIDER" && u.providerProfile ? (
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${verificationBadge[u.providerProfile.verificationStatus] || "bg-gray-100 text-gray-700"}`}
                      >
                        {u.providerProfile.verificationStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--admin-green)]/40">N/A</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--admin-green)]/70">
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
            className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
            style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
          >
            <div className="flex items-start gap-3">
              <UserAvatar user={u} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--admin-green-dark)]">
                  {u.firstName} {u.lastName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--admin-green)]/70">
                  <Mail size={12} className="shrink-0" />
                  {u.email}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--admin-green)]/70">
                  <Phone size={12} className="shrink-0" />
                  {u.phone}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${roleBadge[u.role] || ""}`}
              >
                {u.role.toLowerCase()}
              </span>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusBadge[u.status] || ""}`}
              >
                {u.status}
              </span>
              {u.role === "PROVIDER" && u.providerProfile && (
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${verificationBadge[u.providerProfile.verificationStatus] || ""}`}
                >
                  {u.providerProfile.verificationStatus}
                </span>
              )}
            </div>

            <p className="mt-2 text-[11px] text-[var(--admin-green)]/55">
              Joined{" "}
              {new Date(u.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
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
      <div className="admin-card animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="text-center text-sm text-[var(--admin-green)]/75 sm:text-left">
          Showing{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[var(--admin-green-dark)]">
            {pagination.total}
          </span>{" "}
          users
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

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-green-dark)]/50 p-4 backdrop-blur-sm animate-admin-fade-in-up">
          <div
            className="admin-card w-full max-w-sm animate-admin-scale-in space-y-4 rounded-2xl p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <h3
              id="delete-user-title"
              className="text-lg font-bold text-red-600"
            >
              Delete User
            </h3>
            <p className="text-sm text-[var(--admin-green-dark)]/75">
              Are you sure you want to permanently delete this user? This action cannot be
              undone. A confirmation email will be sent to the user.
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
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                disabled={actionLoading === confirmDeleteId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
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
