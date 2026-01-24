"use client";

import { usePagination } from "./hooks/usePagination";
import SearchHeader from "./SearchHeader";
import SearchFilters from "./SearchFilters";
import ProvidersList from "./ProvidersList";
import Pagination from "./Pagination";
import SearchMap from "./SearchMap/SearchMap";
import { Provider } from "@/components/home/providers/types";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

interface Props {
  searchQuery: string;
  location: string;
  providers: Provider[];
  totalResults: number;
}

export default function ServicesPage({
  searchQuery,
  location,
  providers,
  totalResults,
}: Props) {
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goNext,
    goPrev,
    goTo,
  } = usePagination(providers, 3);

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      {/* Header */}
      <Header />

      {/* Page Title & Summary */}
      <SearchHeader
        searchQuery={searchQuery}
        location={location}
        totalResults={totalResults}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-8 py-8">
        
        {/* Left Column */}
        <main className="flex-1 space-y-6">
          {/* Filters */}
          <SearchFilters searchQuery={searchQuery} location={location} />

          {/* Providers List */}
          <ProvidersList providers={paginatedItems} />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={goTo}
          />
        </main>

        {/* Right Column / Map */}
        <aside className="w-full lg:w-2/5 h-[600px] lg:h-[calc(100vh-100px)] sticky top-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <SearchMap location={location} />
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
