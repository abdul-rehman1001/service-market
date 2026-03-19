"use client";

import { Search, X, Star } from "lucide-react";
import type { ReviewFiltersState } from "@/app/admin/reviews/page";

interface ReviewFiltersProps {
  filters: ReviewFiltersState;
  onFilterChange: (filters: ReviewFiltersState) => void;
}

export default function ReviewFilters({ filters, onFilterChange }: ReviewFiltersProps) {
  const update = (key: keyof ReviewFiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({ search: "", rating: "", dateFrom: "", dateTo: "" });
  };

  const hasActiveFilters =
    filters.search || filters.rating || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      {/* Search row */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by reviewer, provider, service, or comment..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={filters.rating}
          onChange={(e) => update("rating", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          title="From date"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          title="To date"
        />
      </div>

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
