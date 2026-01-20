import { useState } from "react";
import { MapPin, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import ProviderCard from "@/components/home/providers/ProviderCard";
import { Provider } from "@/components/home/providers/types";
import SearchMap from "./SearchMap";

interface SearchResultsProps {
  searchQuery: string;
  location: string;
  providers: Provider[];
  totalResults: number;
}

export default function SearchResults({
  searchQuery,
  location,
  providers,
  totalResults,
}: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(totalResults / itemsPerPage);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedProviders = providers.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="px-6 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Showing results for '<span className="text-emerald-600">{searchQuery}</span>' in '<span className="text-emerald-600">{location}</span>'
        </h1>
        <p className="text-gray-600">
          {totalResults} results found. Review providers below or use the map to refine your search.
        </p>
      </div>

      <div className="flex gap-0">
        {/* Main Content - Left Side */}
        <div className="flex-1 px-6 py-8">
          {/* Search Bar Section */}
          <div className="mb-8 flex gap-4">
            <div className="flex-1 flex gap-3">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  defaultValue={searchQuery}
                  placeholder="Search services..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Location Input */}
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  defaultValue={location}
                  placeholder="City or zip..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
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

            {/* AI Suggest Button */}
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium">
              <Zap className="w-4 h-4" />
              AI Suggest
            </button>
          </div>

          {/* Provider Cards */}
          <div className="space-y-4">
            {displayedProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map(
              (_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                }
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition ${
                      currentPage === pageNum
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="text-gray-500">...</span>
            )}

            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="w-10 h-10 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map - Right Side */}
        <div className="w-2/5 h-screen sticky top-0 bg-gray-100 border-l border-gray-200">
          <SearchMap location={location} />
        </div>
      </div>
    </div>
  );
}