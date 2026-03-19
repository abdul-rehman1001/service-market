"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, Trash2, Eye } from "lucide-react";
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
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-red-100 text-red-700",
  UNVERIFIED: "bg-yellow-100 text-yellow-700",
};

const verificationBadge: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

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
      <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-slate-500">
        No users found matching your filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-100">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Verification</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-slate-50 transition-colors">
                {/* User cell with avatar */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.profileImage ? (
                      <img
                        src={u.profileImage}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-semibold text-xs">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                    )}
                    <span className="font-medium">{u.firstName} {u.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{u.phone}</td>
                <td className="px-4 py-3">
                  <span className="capitalize">{u.role.toLowerCase()}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBadge[u.status] || "bg-gray-100 text-gray-700"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.role === "PROVIDER" && u.providerProfile ? (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${verificationBadge[u.providerProfile.verificationStatus] || "bg-gray-100 text-gray-700"}`}>
                      {u.providerProfile.verificationStatus}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition"
                      title="View details"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleStatusToggle(u)}
                      disabled={actionLoading === u.id}
                      className={`p-1.5 rounded transition ${
                        u.status === "SUSPENDED"
                          ? "hover:bg-emerald-100 text-emerald-600"
                          : "hover:bg-amber-100 text-amber-600"
                      }`}
                      title={u.status === "SUSPENDED" ? "Activate user" : "Suspend user"}
                    >
                      {u.status === "SUSPENDED" ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(u.id)}
                      disabled={actionLoading === u.id}
                      className="p-1.5 rounded hover:bg-red-100 text-red-600 transition"
                      title="Delete user"
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
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-1.5 rounded border hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
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
            <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this user? This action cannot be undone.
              A confirmation email will be sent to the user.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(confirmDeleteId)}
                disabled={actionLoading === confirmDeleteId}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === confirmDeleteId && <Loader2 size={14} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}