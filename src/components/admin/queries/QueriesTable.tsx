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
  OPEN: "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]",
  IN_PROGRESS: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1E3A5F]",
  RESOLVED: "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]",
  CLOSED: "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]",
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

function PersonAvatar({
  image,
  firstName,
  lastName,
}: {
  image: string | null;
  firstName: string;
  lastName: string;
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
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#10B981] text-[10px] font-bold text-white shadow-sm">
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}

function QueryRow({ query, index }: { query: AdminQuery; index: number }) {
  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <span className="inline-flex rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1 font-mono text-xs font-bold text-[#1E3A5F]">
          {query.queryNumber}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar
            image={query.user.profileImage}
            firstName={query.user.firstName}
            lastName={query.user.lastName}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#111827]">
              {query.user.firstName} {query.user.lastName}
            </p>
            <p className="truncate text-xs text-[#6B7280]">{query.user.email}</p>
          </div>
        </div>
      </td>
      <td className="max-w-[200px] px-5 py-4">
        <p className="truncate text-sm text-[#374151]" title={query.subject}>
          {query.subject}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1E3A5F]">
          {TYPE_LABELS[query.queryType] || query.queryType}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
            STATUS_COLORS[query.status] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {STATUS_LABELS[query.status] || query.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6B7280]">
        {new Date(query.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/queries/${query.id}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
          title="View details"
        >
          <Eye size={16} />
        </Link>
      </td>
    </tr>
  );
}

function QueryCard({ query, index }: { query: AdminQuery; index: number }) {
  return (
    <article
      className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-bold text-[#059669]">#{query.queryNumber}</p>
          <p className="mt-1 line-clamp-2 font-semibold text-[#111827]">{query.subject}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            STATUS_COLORS[query.status] || "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {STATUS_LABELS[query.status] || query.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <PersonAvatar
          image={query.user.profileImage}
          firstName={query.user.firstName}
          lastName={query.user.lastName}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111827]">
            {query.user.firstName} {query.user.lastName}
          </p>
          <p className="truncate text-xs text-[#6B7280]">{query.user.email}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-[#1E3A5F]">
          {TYPE_LABELS[query.queryType] || query.queryType}
        </span>
        <span className="text-xs text-[#9CA3AF]">
          {new Date(query.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <Link
          href={`/admin/queries/${query.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all hover:bg-[#059669] sm:w-auto"
        >
          <Eye size={16} />
          View Details
        </Link>
      </div>
    </article>
  );
}

export default function QueriesTable({
  queries,
  pagination,
  onPageChange,
  loading,
}: QueriesTableProps) {
  if (queries.length === 0 && !loading) {
    return (
      <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
          <Inbox size={28} />
        </div>
        <p className="font-semibold text-[#1E3A5F]">No queries found</p>
        <p className="mt-1 text-sm text-[#6B7280]">Try adjusting your filters</p>
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
          of <span className="font-bold text-[#111827]">{pagination.total}</span> queries
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      <div
        className={`animate-admin-scale-in hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:block ${loading ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Query ID
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  User
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Subject
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Type
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Date
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q, index) => (
                <QueryRow key={q.id} query={q} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`space-y-3 md:hidden ${loading ? "opacity-60" : ""}`}>
        {queries.map((q, index) => (
          <QueryCard key={q.id} query={q} index={index} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-center text-sm text-[#6B7280] sm:text-left">
            Page{" "}
            <span className="font-bold text-[#111827]">{pagination.page}</span> of{" "}
            <span className="font-bold text-[#111827]">{pagination.totalPages}</span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:opacity-40"
            >
              <ChevronLeft size={18} />
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
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[2.25rem] rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
                    pagination.page === pageNum
                      ? "bg-[#10B981] text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)]"
                      : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#10B981]/40 hover:bg-[#F5F7F8]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
