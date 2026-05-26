"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProvidersHeader from "./ProvidersHeader";
import ProvidersGrid from "./ProvidersGrid";
import ProvidersEmptyState from "./ProvidersEmptyState";
import AvailabilityFilter from "@/components/providers/AvailabilityFilter";
import { Provider } from "./types";
import { useAvailabilityFilter } from "@/hooks/useAvailabilityFilter";
import { toAvailabilityCheckItems } from "@/lib/provider-availability-input";
import {
  appendUserCoordinatesToParams,
  getStoredUserCoordinates,
} from "@/lib/location/clientLocation";
import { formatAvailabilityLabel } from "@/lib/format-availability-label";

type Pagination = {
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
};

interface FeaturedProvidersProps {
  userLocation?: { lat: number; lng: number } | null;
}

export default function FeaturedProviders({ userLocation }: FeaturedProvidersProps) {
  const [fetchedProviders, setFetchedProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availability = useAvailabilityFilter();

  const [fallbackLocation, setFallbackLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [active, setActive] = useState<{
    category: string | null;
    categoryId: string | null;
    categoryName: string | null;
    subcategory: string | null;
    source: "ai" | "category" | null;
  }>({
    category: null,
    categoryId: null,
    categoryName: null,
    subcategory: null,
    source: null,
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 0,
    total: 0,
    hasMore: false,
  });

  const effectiveLocation = userLocation || fallbackLocation;

  const fetchProviders = async (opts?: {
    page?: number;
    categoryId?: string | null;
    source?: "ai" | "category" | null;
  }) => {
    const page = opts?.page ?? 1;
    const categoryId = opts?.categoryId ?? null;
    const source = opts?.source ?? null;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("limit", "6");
      params.set("page", String(page));
      if (categoryId) params.set("categoryId", categoryId);

      // Only AI-driven searches use combined scoring (price + distance + rating + experience)
      if (source === "ai") {
        params.set("sort", "combined");
        appendUserCoordinatesToParams(params, effectiveLocation);
      }

      const response = await fetch(`/api/providers/top-rated?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch providers");
      }

      const data = await response.json();
      setFetchedProviders(data.data || []);

      const p = data.pagination as Pagination | undefined;
      if (p) {
        setPagination(p);
      } else {
        setPagination({ page: 1, totalPages: 0, total: 0, hasMore: false });
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
      setError("Failed to load providers. Please try again later.");
      setFetchedProviders([]);
      setPagination({ page: 1, totalPages: 0, total: 0, hasMore: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Use cached coordinates if available while waiting for home page location hook.
    const cached = getStoredUserCoordinates(30 * 60_000);
    if (cached) {
      setFallbackLocation({ lat: cached.lat, lng: cached.lng });
    }
  }, []);

  // If AI filtering is active and location arrives after the initial fetch,
  // refetch so distance participates in the combined ranking.
  useEffect(() => {
    if (!effectiveLocation) return;
    if (active.source !== "ai") return;
    if (!active.categoryId) return;
    fetchProviders({ page: pagination.page || 1, categoryId: active.categoryId, source: "ai" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveLocation?.lat, effectiveLocation?.lng]);

  useEffect(() => {
    // Initial load (unfiltered)
    fetchProviders({ page: 1, categoryId: null, source: null });
  }, []);

  // Listen for category filter events from the Categories section
  useEffect(() => {
    const handler = (event: any) => {
      const detail = event?.detail || {};
      const category = (detail.category ?? null) as string | null;
      const subcategory = (detail.subcategory ?? null) as string | null;
      const categoryId = (detail.categoryId ?? null) as string | null;
      const categoryName = (detail.categoryName ?? null) as string | null;
      const source = (detail.source ?? null) as "ai" | "category" | null;

      setActive({ category, subcategory, categoryId, categoryName, source });
      availability.clear();

      // If cleared, show default (page 1)
      if (!categoryId) {
        fetchProviders({ page: 1, categoryId: null, source: null });
        return;
      }

      // Filtered category view starts at page 1
      fetchProviders({ page: 1, categoryId, source });
    };

    window.addEventListener("filterProviders", handler);
    return () => window.removeEventListener("filterProviders", handler);
  }, [availability.clear]);

  const visibleProviders = useMemo(
    () => availability.filterByAvailability(fetchedProviders),
    [fetchedProviders, availability.filterByAvailability, availability.availableIds, availability.applied]
  );

  const runAvailabilityCheck = useCallback(() => {
    if (!availability.applied || !fetchedProviders.length) {
      return;
    }
    const items = toAvailabilityCheckItems(fetchedProviders);
    availability.runCheck(items);
  }, [availability.applied, availability.runCheck, fetchedProviders]);

  useEffect(() => {
    runAvailabilityCheck();
  }, [runAvailabilityCheck]);

  const handleAvailabilityApply = () => {
    const nextFilter = availability.apply();
    if (!nextFilter) {
      return;
    }
    const items = toAvailabilityCheckItems(fetchedProviders);
    availability.runCheck(items, nextFilter);
  };

  const appliedLabel = availability.applied
    ? formatAvailabilityLabel(availability.applied.date, availability.applied.time)
    : null;

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
    fetchProviders({ page, categoryId: active.categoryId, source: active.source });
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

        {active.categoryId && (
          <div className="mb-6">
            <AvailabilityFilter
              date={availability.draftDate}
              time={availability.draftTime}
              onDateChange={availability.setDraftDate}
              onTimeChange={availability.setDraftTime}
              onApply={handleAvailabilityApply}
              onClear={availability.clear}
              isActive={availability.isActive}
              checking={availability.checking}
              error={availability.error}
              appliedLabel={appliedLabel}
              resultCount={availability.isActive ? visibleProviders.length : undefined}
              totalCount={fetchedProviders.length}
              disabled={loading || fetchedProviders.length === 0}
            />
          </div>
        )}

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
        ) : visibleProviders.length > 0 ? (
          <>
            <ProvidersGrid providers={visibleProviders} />

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
        ) : fetchedProviders.length > 0 && availability.isActive ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-8 text-center text-amber-900">
            <p className="font-semibold">No providers available at that time</p>
            <p className="mt-2 text-sm text-amber-800">
              Try a different date or time, or clear the availability filter.
            </p>
          </div>
        ) : (
          <ProvidersEmptyState />
        )}
      </div>
    </section>
  );
}
