"use client";

import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import type { UserFiltersState } from "@/app/admin/users/page";

interface UserFiltersProps {
  filters: UserFiltersState;
  onFilterChange: (filters: UserFiltersState) => void;
}

const inputClass =
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[#374151]";

export default function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const update = (key: keyof UserFiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({
      search: "",
      role: "",
      status: "",
      verification: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.role ||
    filters.status ||
    filters.verification ||
    filters.dateFrom ||
    filters.dateTo;

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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
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
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div>
            <label className={labelClass}>Role</label>
            <select
              value={filters.role}
              onChange={(e) => update("role", e.target.value)}
              className={inputClass}
            >
              <option value="">All Roles</option>
              <option value="SEEKER">Seeker</option>
              <option value="PROVIDER">Provider</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
              className={inputClass}
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Verification</label>
            <select
              value={filters.verification}
              onChange={(e) => update("verification", e.target.value)}
              className={inputClass}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#10B981]" />
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => update("dateFrom", e.target.value)}
              className={inputClass}
              title="Registration from"
            />
          </div>

          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#10B981]" />
              To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => update("dateTo", e.target.value)}
              className={inputClass}
              title="Registration to"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
