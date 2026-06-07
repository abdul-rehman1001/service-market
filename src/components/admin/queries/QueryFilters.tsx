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
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[#374151]";

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
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)]">
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
              <SlidersHorizontal size={16} />
            </div>
            <h3 className="font-bold text-[#1E3A5F]">Filters</h3>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-semibold text-[#EF4444] transition-colors hover:bg-[#FEE2E2]"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
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
            <label className={labelClass}>Status</label>
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
            <label className={labelClass}>Type</label>
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
            <label className={labelClass}>User Type</label>
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
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#9CA3AF]" />
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
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#9CA3AF]" />
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
    </div>
  );
}
