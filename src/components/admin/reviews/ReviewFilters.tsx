"use client";

import { Search, X, SlidersHorizontal, Calendar, Star } from "lucide-react";
import type { ReviewFiltersState } from "@/app/admin/reviews/page";

interface ReviewFiltersProps {
  filters: ReviewFiltersState;
  onFilterChange: (filters: ReviewFiltersState) => void;
}

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

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
          placeholder="Search by reviewer, provider, service, or comment..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-[var(--admin-green)]/70">
            <Star size={12} />
            Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => update("rating", e.target.value)}
            className={inputClass}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
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
            title="From date"
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
            title="To date"
          />
        </div>
      </div>
    </div>
  );
}
