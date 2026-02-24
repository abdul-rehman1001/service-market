"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    parentId: string | null;
    isActive: boolean;
    displayOrder: number;
  };
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [parentId, setParentId] = useState(initialData?.parentId || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(initialData?.displayOrder ?? 0);

  // Fetch categories for parent dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/categories');
        const data = await res.json();

        if (res.ok) {
          // Filter out current category (if editing) to prevent self-parent
          const availableCategories = initialData
            ? data.categories.filter((cat: Category) => cat.id !== initialData.id)
            : data.categories;
          setCategories(availableCategories);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Category name is required');
      return;
    }

    setSubmitting(true);

    try {
      const url = initialData
        ? `/api/admin/categories/${initialData.id}`
        : '/api/admin/categories';

      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          icon: icon.trim() || null,
          parentId: parentId || null,
          isActive,
          displayOrder,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      alert(initialData ? 'Category updated successfully!' : 'Category created successfully!');
      router.push('/admin/categories');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Category Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="e.g. Plumbing"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          placeholder="Brief description of this category"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Icon (Emoji)
        </label>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="e.g. 🔧 or ⚡"
          maxLength={2}
        />
        <p className="text-xs text-gray-500 mt-1">Optional emoji icon for this category</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Parent Category
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="">None (Top Level)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">
          Display Order
        </label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active (visible to users)
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
