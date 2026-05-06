"use client";

import { useMemo, useState } from "react";
import {
  MapPin,
  Star,
  Users,
  ArrowDownUp,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

interface FiltersState {
  rating: number | null;
  priceRange: [number, number];
  radius: number;
  experience: number | null;
  sortBy: string;
}

interface SearchFiltersProps {
  searchQuery: string;
  canUseRadius?: boolean;
  onSearchChange?: (query: string) => void;
  onFiltersChange?: (filters: FiltersState) => void;
  onRadiusChange?: (radius: number) => void;
}

export default function SearchFilters({
  searchQuery,
  canUseRadius = true,
  onSearchChange,
  onFiltersChange,
  onRadiusChange,
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    rating: null,
    priceRange: [0, 5000],
    radius: 0,
    experience: null,
    sortBy: "rating",
  });

  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const handleRadiusChange = (value: number) => {
    handleFilterChange({ radius: value });
    onRadiusChange?.(value);
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(filters.rating) ||
      Boolean(filters.experience) ||
      filters.radius > 0 ||
      filters.priceRange[0] > 0 ||
      filters.priceRange[1] < 5000,
    [filters]
  );

  const clearFilters = () => {
    const resetFilters: FiltersState = {
      rating: null,
      priceRange: [0, 5000],
      radius: 0,
      experience: null,
      sortBy: "rating",
    };

    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
    onRadiusChange?.(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          placeholder="Search by service, provider name, or keyword"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort By</label>
          <div className="relative">
            <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experienced</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rating</label>
          <div className="relative">
            <Star className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            <select
              value={filters.rating === null ? "" : String(filters.rating)}
              onChange={(e) =>
                handleFilterChange({
                  rating: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            >
              <option value="">All Ratings</option>
              <option value="4.5">4.5+ stars</option>
              <option value="4">4.0+ stars</option>
              <option value="3.5">3.5+ stars</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</label>
          <div className="relative">
            <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium">Rs</span>
            <select
              value={`${filters.priceRange[0]}-${filters.priceRange[1]}`}
              onChange={(e) => {
                if (e.target.value === "0-5000") {
                  handleFilterChange({ priceRange: [0, 5000] });
                } else if (e.target.value === "0-999") {
                  handleFilterChange({ priceRange: [0, 999] });
                } else if (e.target.value === "1000-2999") {
                  handleFilterChange({ priceRange: [1000, 2999] });
                } else if (e.target.value === "3000-5000") {
                  handleFilterChange({ priceRange: [3000, 5000] });
                }
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="0-5000">All Prices</option>
              <option value="0-999">Budget (Rs. 0-999)</option>
              <option value="1000-2999">Standard (Rs. 1000-2999)</option>
              <option value="3000-5000">Premium (Rs. 3000-5000)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</label>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
            <select
              value={filters.experience === null ? "" : String(filters.experience)}
              onChange={(e) =>
                handleFilterChange({
                  experience: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Any Experience</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
              <option value="15">15+ years</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div layout className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Search Radius
          </label>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 sm:text-sm">
            {filters.radius === 0 ? "No Limit" : `${filters.radius} km`}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="50"
          value={filters.radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          disabled={!canUseRadius}
          className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-slate-200 to-emerald-200 accent-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex justify-between text-xs text-slate-500">
          <span>No Limit</span>
          <span>50 km</span>
        </div>

        {!canUseRadius && (
          <p className="text-xs text-rose-600">
            Turn on location access to apply nearby radius filtering.
          </p>
        )}
      </motion.div>

      <motion.div layout className="flex flex-wrap items-center gap-2 pt-1">
        {filters.rating && (
          <button
            onClick={() => handleFilterChange({ rating: null })}
            className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
          >
            Rating {filters.rating}+
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {filters.experience && (
          <button
            onClick={() => handleFilterChange({ experience: null })}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
          >
            {filters.experience}+ yrs
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? (
          <button
            onClick={() => handleFilterChange({ priceRange: [0, 5000] })}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200"
          >
            Rs. {filters.priceRange[0]} - {filters.priceRange[1]}
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {filters.radius > 0 && (
          <button
            onClick={() => handleRadiusChange(0)}
            className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-200"
          >
            Radius {filters.radius} km
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
