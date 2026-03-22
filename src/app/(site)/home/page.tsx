"use client";

import { useState, useEffect } from "react";
import SearchSection from "@/components/home/SearchSection";
import Categories from "@/components/home/Categories";
import FeaturedProviders from "@/components/home/providers/FeaturedProviders";
import Footer from "@/components/layout/Footer";

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
    <div className="bg-[#f5f7f8] min-h-screen">
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

      {/* Hide Categories when AI search is driving the filter */}
      {!aiFilter.active && <Categories />}

      <div id="providers-section">
        <FeaturedProviders />
      </div>
      
      <Footer />
    </div>
  );
}
