"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { BookingFiltersState } from "@/app/admin/bookings/page";

interface BookingFiltersProps {
  filters: BookingFiltersState;
  onFilterChange: (filters: BookingFiltersState) => void;
}

interface Category {
  id: string;
  name: string;
}

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
    filters.search || filters.status || filters.categoryId ||
    filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      {/* Search row */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by booking ID, customer name, or provider name..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select
          value={filters.status}
          onChange={(e) => update("status", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
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

        <select
          value={filters.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          title="Scheduled from"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
          title="Scheduled to"
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
