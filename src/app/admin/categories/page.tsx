"use client";

import CategoryTable from "@/components/admin/categories/CategoryTable";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";

export default function CategoriesPage() {
  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <Layers size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Categories
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              Organize services with categories and subcategories
            </p>
          </div>
        </div>

        <Link
          href="/admin/categories/new"
          className="animate-admin-scale-in inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[var(--admin-green)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[var(--admin-green-dark)] hover:shadow-lg sm:self-auto"
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
