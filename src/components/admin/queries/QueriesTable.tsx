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
  OPEN: "bg-amber-50 text-amber-800 border border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
  RESOLVED:
    "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  CLOSED: "bg-slate-100 text-slate-600 border border-slate-200",
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
        className="h-8 w-8 shrink-0 rounded-lg object-cover ring-2 ring-[var(--admin-beige)]/80"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--admin-green)] to-[var(--admin-green-dark)] text-[10px] font-bold text-white">
      {firstName[0]}
      {lastName[0]}
    </div>
  );
}

function QueryRow({
  query,
  index,
}: {
  query: AdminQuery;
  index: number;
}) {
  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <span className="font-mono text-xs font-semibold text-[var(--admin-green-dark)]">
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
            <p className="truncate text-sm font-medium text-[var(--admin-green-dark)]">
              {query.user.firstName} {query.user.lastName}
            </p>
            <p className="truncate text-xs text-[var(--admin-green)]/60">{query.user.email}</p>
          </div>
        </div>
      </td>
      <td className="max-w-[200px] px-5 py-4">
        <p className="truncate text-sm text-[var(--admin-green-dark)]/80" title={query.subject}>
          {query.subject}
        </p>
      </td>
      <td className="px-5 py-4">
        <span className="inline-block rounded-lg bg-[var(--admin-green-muted)] px-2 py-1 text-xs font-medium text-[var(--admin-green-dark)]">
          {TYPE_LABELS[query.queryType] || query.queryType}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[query.status] || "bg-gray-100 text-gray-700"}`}
        >
          {STATUS_LABELS[query.status] || query.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--admin-green)]/70">
        {new Date(query.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/queries/${query.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-beige)]/60 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
        >
          <Eye size={14} />
          View
        </Link>
      </td>
    </tr>
  );
}

function QueryCard({ query, index }: { query: AdminQuery; index: number }) {
  return (
    <article
      className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-bold text-[var(--admin-green)]">
            #{query.queryNumber}
          </p>
          <p className="mt-1 font-semibold text-[var(--admin-green-dark)] line-clamp-2">
            {query.subject}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[query.status] || ""}`}
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
          <p className="text-sm font-medium text-[var(--admin-green-dark)]">
            {query.user.firstName} {query.user.lastName}
          </p>
          <p className="truncate text-xs text-[var(--admin-green)]/60">{query.user.email}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[var(--admin-green-muted)] px-2 py-0.5 text-xs font-medium text-[var(--admin-green-dark)]">
          {TYPE_LABELS[query.queryType] || query.queryType}
        </span>
        <span className="text-xs text-[var(--admin-green)]/55">
          {new Date(query.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
        <Link
          href={`/admin/queries/${query.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--admin-green-dark)] sm:w-auto"
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
      <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
        <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
          <Inbox size={32} />
        </div>
        <p className="font-semibold text-[var(--admin-green-dark)]">No queries found</p>
        <p className="mt-1 text-sm text-[var(--admin-green)]/60">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`admin-card animate-admin-scale-in hidden overflow-hidden rounded-2xl md:block ${loading ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)] to-[var(--admin-beige)]/20">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Query ID
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  User
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Subject
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Type
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                  Date
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
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
        <div className="admin-card animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-center text-sm text-[var(--admin-green)]/75 sm:text-left">
            Showing{" "}
            <span className="font-semibold text-[var(--admin-green-dark)]">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--admin-green-dark)]">{pagination.total}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] disabled:opacity-40"
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
                  className={`min-w-[2.25rem] rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                    pagination.page === pageNum
                      ? "bg-[var(--admin-green)] text-white shadow-sm"
                      : "border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] hover:border-[var(--admin-green)]"
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
