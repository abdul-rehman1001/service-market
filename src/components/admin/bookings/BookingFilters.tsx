"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
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
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[#374151]";

export default function BookingFilters({ filters, onFilterChange }: BookingFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    authenticatedFetch("/api/admin/categories", { cache: "no-store" })
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
            placeholder="Search by booking ID, customer, or provider..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Status</label>
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
            <label className={labelClass}>Category</label>
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
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#9CA3AF]" />
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
            <label className={`${labelClass} flex items-center gap-1`}>
              <Calendar size={12} className="text-[#9CA3AF]" />
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
    </div>
  );
}
