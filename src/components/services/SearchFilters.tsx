// src/components/services/SearchFilters.tsx
import { MapPin, Zap } from "lucide-react";
import { useState } from "react";

interface Props {
  searchQuery: string;
  location: string;
}

export default function SearchFilters({ searchQuery, location }: Props) {
  const [radius, setRadius] = useState(5);

  return (
    <div className="mb-8 space-y-4">
      {/* Top Row: Search Inputs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Service Search */}
        <input
          defaultValue={searchQuery}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          placeholder="Search services..."
        />

        {/* Location Search */}
        <div className="relative flex-1 sm:flex-1">
          <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            defaultValue={location}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            placeholder="City or zip..."
          />
        </div>
      </div>

      {/* Bottom Row: Filters and Radius */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-start sm:items-center">
        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center gap-2 whitespace-nowrap">
            <span>Top Rated</span>
            <span className="text-xs">▼</span>
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center gap-2 whitespace-nowrap">
            <span>Price</span>
            <span className="text-xs">▼</span>
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center gap-2 whitespace-nowrap">
            <span>Availability</span>
            <span className="text-xs">▼</span>
          </button>
        </div>

        {/* Search Radius Slider */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-lg whitespace-nowrap flex-1 sm:flex-initial">
          <label className="text-sm font-medium text-gray-700 min-w-fit">Radius:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-sm font-semibold text-emerald-600 min-w-12">{radius} km</span>
        </div>
      </div>
    </div>
  );
}
