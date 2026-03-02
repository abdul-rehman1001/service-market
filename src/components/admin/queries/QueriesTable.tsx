"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, Inbox } from "lucide-react";
import type { AdminQuery, Pagination } from "@/app/admin/queries/page";

interface QueriesTableProps {
  queries: AdminQuery[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const TYPE_LABELS: Record<string, string> = {
  GENERAL: "General",
  SERVICE_ISSUE: "Service Issue",
  PAYMENT: "Payment",
  BOOKING: "Booking",
  ACCOUNT: "Account",
  OTHER: "Other",
};

export default function QueriesTable({
  queries,
  pagination,
  onPageChange,
  loading,
}: QueriesTableProps) {
  if (queries.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Inbox size={48} className="mx-auto text-slate-300 mb-3" />
        <p className="text-slate-500 text-lg">No queries found</p>
        <p className="text-slate-400 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3 text-left font-medium text-slate-600">Query ID</th>
              <th className="p-3 text-left font-medium text-slate-600">User</th>
              <th className="p-3 text-left font-medium text-slate-600">Subject</th>
              <th className="p-3 text-left font-medium text-slate-600">Type</th>
              <th className="p-3 text-left font-medium text-slate-600">Status</th>
              <th className="p-3 text-left font-medium text-slate-600">Date</th>
              <th className="p-3 text-right font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className={loading ? "opacity-50" : ""}>
            {queries.map((q) => (
              <tr key={q.id} className="border-t hover:bg-slate-50 transition">
                <td className="p-3 font-mono text-xs font-medium text-slate-700">
                  {q.queryNumber}
                </td>
                <td className="p-3">
                  <div>
                    <p className="font-medium text-slate-800">
                      {q.user.firstName} {q.user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{q.user.email}</p>
                  </div>
                </td>
                <td className="p-3 max-w-[200px]">
                  <p className="text-slate-700 truncate">{q.subject}</p>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-600">
                    {TYPE_LABELS[q.queryType] || q.queryType}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      STATUS_COLORS[q.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {STATUS_LABELS[q.status] || q.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(q.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/queries/${q.id}`}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    pagination.page === pageNum
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
