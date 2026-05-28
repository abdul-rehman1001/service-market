"use client";

import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import type { UserFiltersState } from "@/app/admin/users/page";

interface UserFiltersProps {
  filters: UserFiltersState;
  onFilterChange: (filters: UserFiltersState) => void;
}

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

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
    <div className="admin-card rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
            <SlidersHorizontal size={18} />
          </div>
          <h3 className="font-semibold text-[var(--admin-green-dark)]">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
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
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Role
          </label>
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
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Status
          </label>
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
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Verification
          </label>
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
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-[var(--admin-green)]/70">
            <Calendar size={12} />
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
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-[var(--admin-green)]/70">
            <Calendar size={12} />
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
  );
}
