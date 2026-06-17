"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import { Loader2 } from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        // Fetch all categories and find the one we need
        const res = await authenticatedFetch('/api/admin/categories');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch category');
        }

        const foundCategory = data.categories.find((cat: any) => cat.id === id);

        if (!foundCategory) {
          throw new Error('Category not found');
        }

        setCategory(foundCategory);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Loading category...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => router.push('/admin/categories')}
            className="mt-3 text-sm text-red-700 hover:underline"
          >
            ← Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>
      <CategoryForm initialData={category} />
    </div>
  );
}
