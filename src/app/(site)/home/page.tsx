"use client";

import { useState, useEffect } from "react";
import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/providers/FeaturedProviders";
import Footer from "@/components/layout/Footer";
import { useUserLocation } from "@/hooks/useUserLocation";

type AiFilterState = {
  active: boolean;
  category: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export default function HomePage() {
  const [aiFilter, setAiFilter] = useState<AiFilterState>({
    active: false,
    category: null,
    categoryId: null,
    categoryName: null,
  });

  const { location, status, error } = useUserLocation({ requestOnMount: true });

  // Auto-scroll to providers section whenever a provider filter is applied.
  useEffect(() => {
    const handleFilterProviders = (event: any) => {
      const detail = event?.detail || {};
      const hasFilter = Boolean(detail?.categoryId || detail?.category);
      if (!hasFilter) return;

      // Let the UI update (and providers start fetching) before scrolling.
      setTimeout(() => {
        document
          .getElementById("providers-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    };

    window.addEventListener("filterProviders", handleFilterProviders);
    return () => window.removeEventListener("filterProviders", handleFilterProviders);
  }, []);

  // Listen for AI search events
  useEffect(() => {
    const handleAISearch = (event: any) => {
      const detail = event?.detail || {};
      const category = (detail.category ?? null) as string | null;
      const categoryId = (detail.categoryId ?? null) as string | null;
      const categoryName = (detail.categoryName ?? null) as string | null;

      if (!category && !categoryId) {
        setAiFilter({ active: false, category: null, categoryId: null, categoryName: null });
        window.dispatchEvent(
          new CustomEvent("filterProviders", {
            detail: {
              category: null,
              subcategory: null,
              categoryId: null,
              categoryName: null,
              source: null,
            },
          })
        );
        return;
      }

      setAiFilter({
        active: true,
        category,
        categoryId,
        categoryName,
      });

      // Drive FeaturedProviders filtering (same UX as Categories section)
      window.dispatchEvent(
        new CustomEvent("filterProviders", {
          detail: {
            category,
            subcategory: null,
            categoryId,
            categoryName,
            source: "ai",
          },
        })
      );
    };

    window.addEventListener('aiSearchProviders', handleAISearch);
    return () => window.removeEventListener('aiSearchProviders', handleAISearch);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchSection onClearSearch={() => {
        setAiFilter({ active: false, category: null, categoryId: null, categoryName: null });
        window.dispatchEvent(
          new CustomEvent("filterProviders", {
            detail: {
              category: null,
              subcategory: null,
              categoryId: null,
              categoryName: null,
              source: null,
            },
          })
        );
      }} />

      {(status === "denied" || status === "error" || status === "unsupported") && (
        <div className="mx-auto mt-3 max-w-7xl px-4 sm:mt-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm">
            {error || "Location is unavailable. Nearby ranking may be less accurate."}
          </div>
        </div>
      )}

      {/* Hide Categories when AI search is driving the filter */}
      {!aiFilter.active && <Categories />}

      <div id="providers-section">
        <FeaturedProviders userLocation={location ? { lat: location.lat, lng: location.lng } : null} />
      </div>
      
      <div className="mt-8 sm:mt-12">
        <Footer />
      </div>
    </div>
  );
}
