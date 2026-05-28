"use client";

import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import type { QueryFiltersState } from "@/app/admin/queries/page";

interface QueryFiltersProps {
  filters: QueryFiltersState;
  onFiltersChange: (filters: QueryFiltersState) => void;
  onClear: () => void;
}

const QUERY_TYPES = [
  { value: "", label: "All Types" },
  { value: "GENERAL", label: "General" },
  { value: "SERVICE_ISSUE", label: "Service Issue" },
  { value: "PAYMENT", label: "Payment" },
  { value: "BOOKING", label: "Booking" },
  { value: "ACCOUNT", label: "Account" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const USER_TYPES = [
  { value: "", label: "All Users" },
  { value: "SEEKER", label: "Seeker" },
  { value: "PROVIDER", label: "Provider" },
];

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

export default function QueryFilters({
  filters,
  onFiltersChange,
  onClear,
}: QueryFiltersProps) {
  const update = (key: keyof QueryFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="admin-card rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
            <SlidersHorizontal size={18} />
          </div>
          <h3 className="font-semibold text-[var(--admin-green-dark)]">Filters</h3>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-green)]/50"
        />
        <input
          type="text"
          placeholder="Search by Query ID, subject, user name, or email..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Type
          </label>
          <select
            value={filters.queryType}
            onChange={(e) => update("queryType", e.target.value)}
            className={inputClass}
          >
            {QUERY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            User Type
          </label>
          <select
            value={filters.userType}
            onChange={(e) => update("userType", e.target.value)}
            className={inputClass}
          >
            {USER_TYPES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-[var(--admin-green)]/70">
            <Calendar size={12} />
            From
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-[var(--admin-green)]/70">
            <Calendar size={12} />
            To
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
