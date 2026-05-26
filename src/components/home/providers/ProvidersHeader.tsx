import { Filter } from "lucide-react";

interface Props {
  category: string | null;
  categoryName?: string | null;
  subcategory: string | null;
  onClear: () => void;
}

export default function ProvidersHeader({
  category,
  categoryName,
  subcategory,
  onClear,
}: Props) {
  const format = (s: string) =>
    s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const heading = categoryName || "Featured Providers";

  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          Providers
        </p>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
          {heading}
        </h2>

        {category && !categoryName && (
          <p className="mt-1 text-xs text-slate-600 sm:text-sm">
            Showing results for {format(category)}
            {subcategory && ` → ${format(subcategory)}`}
          </p>
        )}
      </div>

      {category && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:w-auto"
        >
          <Filter className="h-4 w-4" />
          Clear filter
        </button>
      )}
    </div>
  );
}
