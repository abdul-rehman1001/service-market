'use client';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Page Title & Summary */}
      <SearchHeader
        searchQuery={searchQuery}
        location={location}
        totalResults={totalResults}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 flex gap-6">
        {/* Left Column */}
        <main className="flex-1 py-8">
          <SearchFilters
            searchQuery={searchQuery}
            location={location}
          />

          <ProvidersList providers={paginatedItems} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={goTo}
          />
        </main>

        {/* Right Column / Map */}
        <aside className="w-2/5 h-screen sticky top-0 border-l">
          <SearchMap location={location} />
        </aside>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
