"use client";

import { Search, X } from "lucide-react";
import type { UserFiltersState } from "@/app/admin/users/page";

interface UserFiltersProps {
  filters: UserFiltersState;
  onFilterChange: (filters: UserFiltersState) => void;
}

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
    filters.search || filters.role || filters.status || filters.verification ||
    filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      {/* Search row */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={filters.role}
          onChange={(e) => update("role", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Roles</option>
          <option value="SEEKER">Seeker</option>
          <option value="PROVIDER">Provider</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>

        <select
          value={filters.verification}
          onChange={(e) => update("verification", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Verification</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          placeholder="From date"
          title="Registration from"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          placeholder="To date"
          title="Registration to"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
        >
          <X size={14} /> Clear all filters
        </button>
      )}
    </div>
  );
}