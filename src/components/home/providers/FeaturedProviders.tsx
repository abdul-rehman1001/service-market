"use client";

import ProvidersHeader from "./ProvidersHeader";
import ProvidersGrid from "./ProvidersGrid";
import ProvidersAIBadge from "./ProvidersAIBadge";
import { useProviderFilter } from "./useProviderFilter";
import { allProviders } from "./data"; // optional extraction

export default function FeaturedProviders() {
  const { filtered, active, clear } = useProviderFilter(allProviders);

  return (
    <section className="py-12 bg-[#f5f7f8]">
      <div className="max-w-7xl mx-auto px-6">

        <ProvidersHeader
          category={active.category}
          subcategory={active.subcategory}
          onClear={clear}
        />

        {active.category && <ProvidersAIBadge count={filtered.length} />}

        {filtered.length > 0 ? (
          <ProvidersGrid providers={filtered} />
        ) : (
          <p className="text-center py-12 text-gray-600">
            No providers found
          </p>
        )}

      </div>
    </section>
  );
}
