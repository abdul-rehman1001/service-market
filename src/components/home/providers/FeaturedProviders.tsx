"use client";

import { useEffect, useState } from "react";
import ProvidersHeader from "./ProvidersHeader";
import ProvidersGrid from "./ProvidersGrid";
import ProvidersEmptyState from "./ProvidersEmptyState";
import ProvidersAIBadge from "./ProvidersAIBadge";
import { useProviderFilter } from "./useProviderFilter";
import { Provider } from "./types";

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { filtered, active, clear } = useProviderFilter(providers);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/providers/top-rated?limit=6");
        
        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }

        const data = await response.json();
        setProviders(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching providers:", err);
        setError("Failed to load providers. Please try again later.");
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return (
    <section className="py-12 bg-[#f5f7f8]">
      <div className="max-w-7xl mx-auto px-6">
        <ProvidersHeader
          category={active.category}
          subcategory={active.subcategory}
          onClear={clear}
        />

        {active.category && <ProvidersAIBadge count={filtered.length} />}

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
        ) : filtered.length > 0 ? (
          <ProvidersGrid providers={filtered} />
        ) : (
          <ProvidersEmptyState />
        )}
      </div>
    </section>
  );
}
