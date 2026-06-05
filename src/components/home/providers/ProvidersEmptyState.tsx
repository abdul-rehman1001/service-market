import { Search } from "lucide-react";

export default function ProvidersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E8F0]/80 bg-white/95 px-6 py-12 text-center shadow-[0_4px_24px_rgba(15,23,42,0.04)] sm:py-14">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 ring-2 ring-[#10B981]/10">
        <Search className="h-7 w-7 text-[#10B981] sm:h-8 sm:w-8" />
      </div>
      <p className="text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
        No providers found
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#64748B]">
        Try a different category or adjust your availability filter.
      </p>
    </div>
  );
}
