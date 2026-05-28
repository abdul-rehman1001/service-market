"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import type { BookingFiltersState } from "@/app/admin/bookings/page";

interface BookingFiltersProps {
  filters: BookingFiltersState;
  onFilterChange: (filters: BookingFiltersState) => void;
}

interface Category {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

export default function BookingFilters({ filters, onFilterChange }: BookingFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const update = (key: keyof BookingFiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({
      search: "",
      status: "",
      categoryId: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.categoryId ||
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
          placeholder="Search by booking ID, customer, or provider..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            <option value="">All Statuses</option>
            <option value="HOLD">Hold</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="AUTO_CANCELLED">Auto Cancelled</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
            title="Scheduled from"
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
            title="Scheduled to"
          />
        </div>
      </div>
    </div>
  );
}
