"use client";

import CategoryTable from "@/components/admin/categories/CategoryTable";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";

export default function CategoriesPage() {
  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">Categories</h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              Organize services with categories and subcategories
            </p>
          </div>
        </div>

        <Link
          href="/admin/categories/new"
          className="animate-admin-scale-in inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] active:scale-[0.98] sm:self-auto"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add Category
        </Link>
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-2">
        <CategoryTable />
      </div>
    </section>
  );
}
