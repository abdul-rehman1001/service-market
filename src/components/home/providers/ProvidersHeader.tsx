import { Filter, X } from "lucide-react";

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
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
          Providers
        </p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
          {heading}
        </h2>

        {category && !categoryName && (
          <p className="mt-2 text-sm text-[#64748B]">
            Showing results for {format(category)}
            {subcategory && ` → ${format(subcategory)}`}
          </p>
        )}
      </div>

      {category && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#10B981]/40 hover:bg-emerald-50/50 hover:text-[#059669] sm:w-auto"
        >
          <X className="h-4 w-4" />
          Clear filter
        </button>
      )}
    </div>
  );
}
