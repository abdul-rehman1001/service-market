import { Search } from "lucide-react";

export default function ProvidersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center sm:py-12">
      <div className="mb-4 rounded-full bg-slate-100 p-5">
        <Search className="h-7 w-7 text-slate-400 sm:h-8 sm:w-8" />
      </div>
      <p className="text-base font-semibold text-slate-800 sm:text-lg">No providers found</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
        Try a different category or adjust your availability filter.
      </p>
    </div>
  );
}
