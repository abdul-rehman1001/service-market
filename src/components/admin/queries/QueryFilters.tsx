"use client";

import { Search, X } from "lucide-react";
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
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Query ID, subject, user name, or email..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Dropdowns + Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.queryType}
          onChange={(e) => update("queryType", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {QUERY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={filters.userType}
          onChange={(e) => update("userType", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {USER_TYPES.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="From date"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="To date"
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 transition"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );
}
