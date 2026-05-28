"use client";

import { useState, useEffect, useMemo } from "react";
import CategoryRow, { CategoryCard } from "./CategoryRow";
import { Loader2, Layers, FolderTree, CheckCircle } from "lucide-react";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const active = categories.filter((c) => c.isActive).length;
    const topLevel = categories.filter((c) => !c.parentId).length;
    return { active, topLevel, total: categories.length };
  }, [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch categories");
      }

      setCategories(data.categories);
      setError("");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

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
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

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
      <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
        <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading categories…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-card animate-admin-scale-in rounded-2xl p-8 text-center">
        <p className="font-semibold text-red-600">Error loading categories</p>
        <p className="mt-1 text-sm text-[var(--admin-green-dark)]/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { label: "Total", value: stats.total, icon: Layers, stagger: "admin-stagger-1" },
            { label: "Active", value: stats.active, icon: CheckCircle, stagger: "admin-stagger-2" },
            { label: "Top Level", value: stats.topLevel, icon: FolderTree, stagger: "admin-stagger-3" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`admin-card animate-admin-fade-in-up ${stat.stagger} flex items-center gap-3 rounded-2xl p-4`}
            >
              <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
                <stat.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--admin-green)]/70">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-[var(--admin-green-dark)]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
            <Layers size={32} />
          </div>
          <p className="font-semibold text-[var(--admin-green-dark)]">No categories yet</p>
          <p className="mt-1 text-sm text-[var(--admin-green)]/60">
            Create your first category to get started
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="admin-card animate-admin-scale-in hidden overflow-hidden rounded-2xl md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)] to-[var(--admin-beige)]/20">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Category
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Parent
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Usage
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
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

          {/* Mobile cards */}
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
      )}
    </div>
  );
}
