"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ServiceRow, { ServiceCard } from "./ServiceRow";
import {
  Loader2,
  Search,
  X,
  SlidersHorizontal,
  Wrench,
  CheckCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  defaultDurationMinutes: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  provider: {
    id: string;
    businessName: string | null;
    verificationStatus: string;
    averageRating: string;
    totalReviews: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string | null;
    };
  };
  _count: {
    bookings: number;
  };
}

interface Category {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-3 py-2.5 text-sm text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 focus:border-[var(--admin-green)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20";

export default function ServicesTable() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const pageStats = useMemo(() => {
    const active = services.filter((s) => s.isActive).length;
    const totalBookings = services.reduce((sum, s) => sum + s._count.bookings, 0);
    return { active, totalBookings };
  }, [services]);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("sort", sortBy);
      params.set("order", order);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await fetch(`/api/admin/services?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch services");
      }

      setServices(data.services);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setError("");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortBy, order, page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ""));
        return;
      }

      alert("Service deleted successfully");
      fetchServices();
    } catch (err: unknown) {
      const e = err as Error;
      alert("Failed to delete service: " + e.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update service");
      }

      fetchServices();
    } catch (err: unknown) {
      const e = err as Error;
      alert("Failed to toggle status: " + e.message);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    setSortBy("createdAt");
    setOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = search || categoryFilter || statusFilter;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="admin-card rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
              <SlidersHorizontal size={18} />
            </div>
            <h3 className="font-semibold text-[var(--admin-green-dark)]">Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <X size={14} />
              Clear all
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--admin-green)]/50"
            />
            <input
              type="text"
              placeholder="Search by name, provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Last Updated</option>
                <option value="name">Name</option>
                <option value="minPrice">Price</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--admin-green)]/70">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value);
                  setPage(1);
                }}
                className={inputClass}
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-[var(--admin-green)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--admin-green-dark)] hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stats */}
      {!loading && !error && total > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            { label: "Total Services", value: total.toLocaleString(), icon: Wrench, stagger: "admin-stagger-1" },
            { label: "Active (page)", value: pageStats.active, icon: CheckCircle, stagger: "admin-stagger-2" },
            {
              label: "Bookings (page)",
              value: pageStats.totalBookings,
              icon: Calendar,
              stagger: "admin-stagger-3",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`admin-card animate-admin-fade-in-up ${stat.stagger} flex items-center gap-3 rounded-2xl p-4`}
            >
              <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
                <stat.icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--admin-green)]/70">{stat.label}</p>
                <p className="text-xl font-bold text-[var(--admin-green-dark)]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
          <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
          <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading services…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="admin-card animate-admin-scale-in rounded-2xl p-8 text-center">
          <p className="font-semibold text-red-600">Error loading services</p>
          <p className="mt-1 text-sm text-[var(--admin-green-dark)]/70">{error}</p>
          <button
            type="button"
            onClick={fetchServices}
            className="mt-4 rounded-xl bg-[var(--admin-green)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-green-dark)]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && services.length === 0 && (
        <div className="admin-card animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <div className="mb-4 rounded-2xl bg-[var(--admin-green-muted)] p-4 text-[var(--admin-green)]">
            <Wrench size={32} />
          </div>
          <p className="font-semibold text-[var(--admin-green-dark)]">No services found</p>
          <p className="mt-1 text-sm text-[var(--admin-green)]/60">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "No services have been added yet"}
          </p>
        </div>
      )}

      {/* Table & cards */}
      {!loading && !error && services.length > 0 && (
        <>
          <p className="text-sm text-[var(--admin-green)]/70">
            <span className="font-semibold text-[var(--admin-green-dark)]">{total}</span> service
            {total !== 1 ? "s" : ""} found
          </p>

          <div className="admin-card animate-admin-scale-in hidden overflow-hidden rounded-2xl md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-beige)]/50 bg-gradient-to-r from-[var(--admin-green-muted)] to-[var(--admin-beige)]/20">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Service
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Provider
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Category
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Price Range
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Bookings
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-green-dark)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, index) => (
                    <ServiceRow
                      key={service.id}
                      service={service}
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
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="admin-card animate-admin-fade-in-up flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-center text-sm text-[var(--admin-green)]/75 sm:text-left">
            Page{" "}
            <span className="font-semibold text-[var(--admin-green-dark)]">{page}</span> of{" "}
            <span className="font-semibold text-[var(--admin-green-dark)]">{totalPages}</span>
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--admin-beige)] bg-white text-[var(--admin-green-dark)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
