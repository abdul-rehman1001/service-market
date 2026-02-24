'use client';

import { useState, useEffect } from 'react';
import CategoryRow from "./CategoryRow";
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  isActive: boolean;
  displayOrder: number;
  parent: {
    id: string;
    name: string;
  } | null;
  children: any[];
  _count: {
    services: number;
    portfolios: number;
    problemQueries: number;
  };
}

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.categories);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ''));
        return;
      }

      alert('Category deleted successfully');
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      fetchCategories(); // Refresh the list
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-red-600 text-center">
          <p className="font-semibold">Error loading categories</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-gray-500 text-center">
          No categories found. Create your first category to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Parent</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Usage</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
