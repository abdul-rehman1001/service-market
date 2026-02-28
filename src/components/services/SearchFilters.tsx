// src/components/services/SearchFilters.tsx
"use client";

import { useState } from "react";
import { MapPin, Zap, Star, DollarSign, Users, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FiltersState {
  rating: number | null;
  priceRange: [number, number];
  radius: number;
  experience: number | null;
  sortBy: string;
}

interface SearchFiltersProps {
  searchQuery: string;
  location: string;
  onFiltersChange?: (filters: FiltersState) => void;
  onRadiusChange?: (radius: number) => void;
}

export default function SearchFilters({
  searchQuery,
  location,
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

  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange?.(updatedFilters);
  };

  const handleRadiusChange = (value: number) => {
    handleFilterChange({ radius: value });
    onRadiusChange?.(value);
  };

  const toggleFilterPanel = (filterName: string) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  const ratingOptions = [
    { value: 4.5, label: "★★★★★ 4.5+ stars" },
    { value: 4.0, label: "★★★★☆ 4.0+ stars" },
    { value: 3.5, label: "★★★★☆ 3.5+ stars" },
  ];

  const priceRanges = [
    { label: "Budget", min: 0, max: 999 },
    { label: "Standard", min: 1000, max: 2999 },
    { label: "Premium", min: 3000, max: 5000 },
  ];

  const experienceOptions = [
    { value: 5, label: "5+ years" },
    { value: 10, label: "10+ years" },
    { value: 15, label: "15+ years" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      {/* Search & Location Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.input
          whileFocus={{ scale: 1.02 }}
          defaultValue={searchQuery}
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
          placeholder="Search services..."
        />

        <motion.div
          whileFocus={{ scale: 1.02 }}
          className="relative flex-1 sm:flex-initial sm:min-w-48"
        >
          <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-emerald-500" />
          <input
            defaultValue={location}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            placeholder="City or location..."
          />
        </motion.div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Sort By */}
        <motion.div layout>
          <button
            onClick={() => toggleFilterPanel("sort")}
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:border-emerald-400 hover:from-emerald-50 hover:to-emerald-100 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Sort By
            </div>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedFilter === "sort" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedFilter === "sort" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute mt-2 w-full sm:w-56 bg-white border-2 border-emerald-200 rounded-xl shadow-lg z-10"
              >
                {[
                  { value: "rating", label: "Highest Rating" },
                  { value: "experience", label: "Most Experienced" },
                  { value: "price", label: "Lowest Price" },
                  { value: "distance", label: "Nearest" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange({ sortBy: option.value });
                      setExpandedFilter(null);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-emerald-50 border-b last:border-b-0 transition ${
                      filters.sortBy === option.value
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Rating Filter */}
        <motion.div layout>
          <button
            onClick={() => toggleFilterPanel("rating")}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl text-amber-700 text-sm font-semibold hover:border-amber-400 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Rating
            </div>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedFilter === "rating" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedFilter === "rating" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute mt-2 w-full sm:w-56 bg-white border-2 border-amber-200 rounded-xl shadow-lg z-10"
              >
                <button
                  onClick={() => {
                    handleFilterChange({ rating: null });
                    setExpandedFilter(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-gray-700"
                >
                  All Ratings
                </button>
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange({ rating: option.value });
                      setExpandedFilter(null);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-amber-50 border-b transition ${
                      filters.rating === option.value
                        ? "bg-amber-50 text-amber-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Price Filter */}
        <motion.div layout>
          <button
            onClick={() => toggleFilterPanel("price")}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl text-green-700 text-sm font-semibold hover:border-green-400 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price
            </div>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedFilter === "price" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedFilter === "price" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute mt-2 w-full sm:w-56 bg-white border-2 border-green-200 rounded-xl shadow-lg z-10 p-4 space-y-3"
              >
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      handleFilterChange({
                        priceRange: [range.min, range.max],
                      });
                      setExpandedFilter(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border-2 transition ${
                      filters.priceRange[0] === range.min &&
                      filters.priceRange[1] === range.max
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {range.label}
                    <br />
                    <span className="text-xs text-gray-600">
                      Rs. {range.min} - Rs. {range.max}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Experience Filter */}
        <motion.div layout>
          <button
            onClick={() => toggleFilterPanel("experience")}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl text-blue-700 text-sm font-semibold hover:border-blue-400 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Experience
            </div>
            <ChevronDown
              className={`w-4 h-4 transition ${
                expandedFilter === "experience" ? "rotate-180" : ""
              }`}
            />
          </button>
          <AnimatePresence>
            {expandedFilter === "experience" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute mt-2 w-full sm:w-56 bg-white border-2 border-blue-200 rounded-xl shadow-lg z-10"
              >
                <button
                  onClick={() => {
                    handleFilterChange({ experience: null });
                    setExpandedFilter(null);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b text-gray-700"
                >
                  Any Experience
                </button>
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleFilterChange({ experience: option.value });
                      setExpandedFilter(null);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b transition ${
                      filters.experience === option.value
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Radius Slider - Always Visible */}
      <motion.div
        layout
        className="pt-4 border-t-2 border-gray-200 space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Search Radius
          </label>
          <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
            {filters.radius === 0 ? "No Limit" : `${filters.radius} km`}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={filters.radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="w-full h-3 bg-gradient-to-r from-gray-200 to-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>No Limit</span>
          <span>50 km</span>
        </div>
      </motion.div>

      {/* Active Filters Tags */}
      <motion.div
        layout
        className="flex flex-wrap gap-2 pt-2"
      >
        {filters.rating && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => handleFilterChange({ rating: null })}
            className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full hover:bg-amber-200 transition flex items-center gap-2"
          >
            ★ {filters.rating}+
            <span className="text-lg leading-none">×</span>
          </motion.button>
        )}
        {filters.experience && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => handleFilterChange({ experience: null })}
            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-200 transition flex items-center gap-2"
          >
            {filters.experience}+ yrs
            <span className="text-lg leading-none">×</span>
          </motion.button>
        )}
        {filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => handleFilterChange({ priceRange: [0, 5000] })}
            className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full hover:bg-green-200 transition flex items-center gap-2"
          >
            Rs. {filters.priceRange[0]} - {filters.priceRange[1]}
            <span className="text-lg leading-none">×</span>
          </motion.button>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
