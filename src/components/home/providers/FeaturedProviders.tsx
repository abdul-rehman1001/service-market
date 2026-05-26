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
    <section className="bg-slate-50 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 sm:p-5"
              >
                <div className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 rounded-full bg-slate-200 sm:h-16 sm:w-16" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-5/6 rounded bg-slate-100" />
                </div>
                <div className="mt-4 h-10 rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:text-base">
            {error}
          </div>
        ) : visibleProviders.length > 0 ? (
          <>
            <ProvidersGrid providers={visibleProviders} />

            {active.categoryId && pagination.totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:mt-10 sm:gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-700" />
                </button>

                <div className="flex max-w-[min(100%,16rem)] items-center gap-1 overflow-x-auto sm:max-w-none sm:gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const showPage =
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      Math.abs(pageNum - pagination.page) <= 1;

                    if (!showPage) {
                      if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                        return (
                          <span key={i} className="px-1 text-slate-400 sm:px-2">
                            …
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-semibold transition sm:h-10 sm:min-w-10 ${
                          pagination.page === pageNum
                            ? "bg-emerald-600 text-white shadow-md"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10"
                >
                  <ChevronRight className="h-5 w-5 text-slate-700" />
                </button>
              </div>
            )}
          </>
        ) : fetchedProviders.length > 0 && availability.isActive ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-8 text-center text-amber-900 sm:py-10">
            <p className="text-sm font-semibold sm:text-base">No providers available at that time</p>
            <p className="mt-2 text-xs text-amber-800 sm:text-sm">
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
