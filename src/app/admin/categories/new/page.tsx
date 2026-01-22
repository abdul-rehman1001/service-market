"use client";

import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add New Category</h1>
      <CategoryForm />
    </div>
  );
}
