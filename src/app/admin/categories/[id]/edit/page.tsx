"use client";

import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function EditCategoryPage() {
  // later you will fetch category by id
  const mockCategory = {
    name: "Plumbing",
    parent: "",
    isActive: true,
  };

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>
      <CategoryForm initialData={mockCategory} />
    </div>
  );
}
