import { useEffect, useState } from "react";
import { Provider } from "./types";

export function useProviderFilter(allProviders: Provider[]) {
  const [filtered, setFiltered] = useState(allProviders);
  const [active, setActive] = useState<{ category: string | null; subcategory: string | null }>({
    category: null,
    subcategory: null,
  });

  // Update filtered when allProviders changes
  useEffect(() => {
    setFiltered(allProviders);
  }, [allProviders]);

  useEffect(() => {
    const handler = (event: any) => {
      const { category, subcategory } = event.detail;
      setActive({ category, subcategory });

      const exact = allProviders.filter(
        p => p.category === category && p.subcategory === subcategory
      );

      setFiltered(exact.length ? exact : allProviders.filter(p => p.category === category));
    };

    window.addEventListener("filterProviders", handler);
    return () => window.removeEventListener("filterProviders", handler);
  }, [allProviders]);

  const clear = () => {
    setActive({ category: null, subcategory: null });
    setFiltered(allProviders);
  };

  return { filtered, active, clear };
}
