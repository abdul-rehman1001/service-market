"use client";

import CategoryTable from "@/components/admin/categories/CategoryTable";
import Link from "next/link";

export default function CategoriesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>

        <Link
          href="/admin/categories/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
        >
          + Add Category
        </Link>
      </div>

      <CategoryTable />
    </div>
  );
}
