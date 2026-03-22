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
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-semibold">{heading}</h2>

        {category && !categoryName && (
          <p className="text-sm text-gray-600 mt-1">
            Showing results for {format(category)}
            {subcategory && ` → ${format(subcategory)}`}
          </p>
        )}
      </div>

      {category && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Clear Filter
        </button>
      )}
    </div>
  );
}
