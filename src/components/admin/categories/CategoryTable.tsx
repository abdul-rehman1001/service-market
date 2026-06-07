"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import CategoryRow, { CategoryCard } from "./CategoryRow";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { AlertCircle, Loader2, Layers, FolderTree, CheckCircle } from "lucide-react";

export interface Category {
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
  children: { id: string }[];
  _count: {
    services: number;
    portfolios: number;
    problemQueries: number;
  };
}

export default function CategoryTable() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const active = categories.filter((c) => c.isActive).length;
    const topLevel = categories.filter((c) => !c.parentId).length;
    return { active, topLevel, total: categories.length };
  }, [categories]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authenticatedFetch("/api/admin/categories", { cache: "no-store" });

      if (res.status === 401) {
        router.push("/login?next=/admin/categories");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch categories");
        return;
      }

      setCategories(data.categories);
    } catch {
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/categories");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ""));
        return;
      }

      alert("Category deleted successfully");
      fetchCategories();
    } catch (err: unknown) {
      const e = err as Error;
      alert("Failed to delete category: " + e.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await authenticatedFetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/categories");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      fetchCategories();
    } catch (err: unknown) {
      const e = err as Error;
      alert("Failed to toggle status: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-16 shadow-sm">
        <Loader2 className="animate-spin text-[#10B981]" size={36} />
        <p className="text-sm font-medium text-[#6B7280]">Loading categories…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <StatCard
            title="Total Categories"
            value={stats.total}
            icon={<Layers size={20} />}
            staggerClass="admin-stagger-1"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={<CheckCircle size={20} />}
            staggerClass="admin-stagger-2"
          />
          <StatCard
            title="Top Level"
            value={stats.topLevel}
            icon={<FolderTree size={20} />}
            staggerClass="admin-stagger-3"
          />
        </div>
      )}

      {!error && categories.length === 0 ? (
        <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <Layers size={28} />
          </div>
          <p className="font-semibold text-[#1E3A5F]">No categories yet</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Create your first category to organize platform services
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="animate-admin-scale-in hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Category
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Parent
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Usage
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      index={index}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
