"use client";

import { motion } from "framer-motion";
import { Search, MapPin, Zap } from "lucide-react";

interface Props {
  searchQuery: string;
  location: string;
  totalResults: number;
}

export default function SearchHeader({
  searchQuery,
  location,
  totalResults,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-emerald-100 py-8"
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-4 mb-6"
        >
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Service Providers
            </h1>
            <p className="text-gray-600 mt-1">
              Find the perfect professional for your needs
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Search Query */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-emerald-100 shadow-sm">
            <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Searching for</p>
              <p className="text-lg font-bold text-gray-900">{searchQuery}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-blue-100 shadow-sm">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-600 font-medium">Location</p>
              <p className="text-lg font-bold text-gray-900">{location}</p>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-purple-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 animate-pulse"></div>
            <div>
              <p className="text-xs text-gray-600 font-medium">Providers Found</p>
              <p className="text-lg font-bold text-gray-900">{totalResults}+</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-600 mt-6"
        >
          Showing results sorted by rating, distance, and experience. Use filters to refine your search or view on the map.
        </motion.p>
      </div>
    </motion.div>
  );
}
