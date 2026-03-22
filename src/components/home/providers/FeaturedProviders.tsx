"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProvidersHeader from "./ProvidersHeader";
import ProvidersGrid from "./ProvidersGrid";
import ProvidersEmptyState from "./ProvidersEmptyState";
import { Provider } from "./types";

type Pagination = {
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
};

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [active, setActive] = useState<{
    category: string | null;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: string | null;
  }>({
    category: null,
    categoryId: null,
    categoryName: null,
    subcategory: null,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 0,
    total: 0,
    hasMore: false,
  });

  const fetchProviders = async (opts?: { page?: number; categoryId?: string | null }) => {
    const page = opts?.page ?? 1;
    const categoryId = opts?.categoryId ?? null;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "6");
      params.set("page", String(page));
      if (categoryId) params.set("categoryId", categoryId);

      const response = await fetch(`/api/providers/top-rated?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }

      const data = await response.json();
      setProviders(data.data || []);

      const p = data.pagination as Pagination | undefined;
      if (p) {
        setPagination(p);
      } else {
        setPagination({ page: 1, totalPages: 0, total: 0, hasMore: false });
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Failed to load providers. Please try again later.");
      setProviders([]);
      setPagination({ page: 1, totalPages: 0, total: 0, hasMore: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load (unfiltered)
    fetchProviders({ page: 1, categoryId: null });
  }, []);

  // Listen for category filter events from the Categories section
  useEffect(() => {
    const handler = (event: any) => {
      const detail = event?.detail || {};
      const category = (detail.category ?? null) as string | null;
      const subcategory = (detail.subcategory ?? null) as string | null;
      const categoryId = (detail.categoryId ?? null) as string | null;
      const categoryName = (detail.categoryName ?? null) as string | null;

      setActive({ category, subcategory, categoryId, categoryName });

      // If cleared, show default (page 1)
      if (!categoryId) {
        fetchProviders({ page: 1, categoryId: null });
        return;
      }

      // Filtered category view starts at page 1
      fetchProviders({ page: 1, categoryId });
    };

    window.addEventListener("filterProviders", handler);
    return () => window.removeEventListener("filterProviders", handler);
  }, []);

  const clear = () => {
    window.dispatchEvent(
      new CustomEvent("filterProviders", {
        detail: { category: null, subcategory: null, categoryId: null, categoryName: null },
      })
    );
  };

  const handlePageChange = (page: number) => {
    if (!active.categoryId) return;
    if (page < 1 || page > pagination.totalPages) return;
    fetchProviders({ page, categoryId: active.categoryId });
  };

  return (
    <section className="py-12 bg-[#f5f7f8]">
      <div className="max-w-7xl mx-auto px-6">
        <ProvidersHeader
          category={active.category}
          categoryName={active.categoryName}
          subcategory={active.subcategory}
          onClear={clear}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-r-transparent mb-4"></div>
              <p className="text-gray-600">Loading featured providers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : providers.length > 0 ? (
          <>
            <ProvidersGrid providers={providers} />

            {active.categoryId && pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const showPage =
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      Math.abs(pageNum - pagination.page) <= 1;

                    if (!showPage) {
                      if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                        return (
                          <span key={i} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                          pagination.page === pageNum
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                            : "border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className="p-2 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-transparent transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <ProvidersEmptyState />
        )}
      </div>
    </section>
  );
}
