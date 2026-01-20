// src/components/services/SearchFilters.tsx
import { MapPin, Zap } from "lucide-react";

interface Props {
  searchQuery: string;
  location: string;
}

export default function SearchFilters({ searchQuery, location }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      
      {/* Left: Search Inputs */}
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        {/* Service Search */}
        <input
          defaultValue={searchQuery}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Search services..."
        />

        {/* Location Search */}
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            defaultValue={location}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="City or zip..."
          />
        </div>
      </div>

      {/* Middle: Filters */}
      <div className="flex gap-2 flex-wrap">
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <span className="text-sm font-medium">Top Rated</span>
          <span className="text-gray-400">▼</span>
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <span className="text-sm font-medium">Price</span>
          <span className="text-gray-400">▼</span>
        </button>
        <button className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <span className="text-sm font-medium">Availability</span>
          <span className="text-gray-400">▼</span>
        </button>
      </div>

     
    </div>
  );
}
