"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ServiceRow, { ServiceCard } from "./ServiceRow";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import {
  AlertCircle,
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
  "w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-sm transition-all duration-200 focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20";

const labelClass = "mb-1.5 block text-xs font-semibold text-[#374151]";

export default function ServicesTable() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("sort", sortBy);
      params.set("order", order);
      params.set("page", String(page));
      params.set("limit", String(limit));

      const res = await authenticatedFetch(`/api/admin/services?${params.toString()}`, {
        cache: "no-store",
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/services");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch services");
        return;
      }

      setServices(data.services);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      setError("Failed to fetch services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortBy, order, page, router]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/admin/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await authenticatedFetch(`/api/admin/services/${id}`, { method: "DELETE" });

      if (res.status === 401) {
        router.push("/login?next=/admin/services");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ""));
        return;
      }

      alert(
        data.action === "deactivated"
          ? data.message + (data.details ? `\n${data.details}` : "")
          : data.message || "Service deleted successfully"
      );
      fetchServices();
    } catch (err: unknown) {
      const e = err as Error;
      alert("Failed to delete service: " + e.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await authenticatedFetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/services");
        return;
      }

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
      <div className="animate-admin-fade-in-up admin-stagger-1 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)]">
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
                <SlidersHorizontal size={16} />
              </div>
              <h3 className="font-bold text-[#1E3A5F]">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-semibold text-[#EF4444] transition-colors hover:bg-[#FEE2E2]"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4 p-4 sm:p-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
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
              <label className={labelClass}>Category</label>
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
              <label className={labelClass}>Status</label>
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
              <label className={labelClass}>Sort By</label>
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
              <label className={labelClass}>Order</label>
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
                className="w-full rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] active:scale-[0.98]"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#EF4444]">{error}</p>
            <button
              type="button"
              onClick={fetchServices}
              className="mt-2 text-sm font-semibold text-[#059669] transition-colors hover:text-[#10B981]"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <StatCard
            title="Total Services"
            value={total.toLocaleString()}
            icon={<Wrench size={20} />}
            staggerClass="admin-stagger-1"
          />
          <StatCard
            title="Active (page)"
            value={pageStats.active}
            icon={<CheckCircle size={20} />}
            staggerClass="admin-stagger-2"
          />
          <StatCard
            title="Bookings (page)"
            value={pageStats.totalBookings}
            icon={<Calendar size={20} />}
            staggerClass="admin-stagger-3"
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-16 shadow-sm">
          <Loader2 className="animate-spin text-[#10B981]" size={36} />
          <p className="text-sm font-medium text-[#6B7280]">Loading services…</p>
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="animate-admin-scale-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <Wrench size={28} />
          </div>
          <p className="font-semibold text-[#1E3A5F]">No services found</p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {hasActiveFilters
              ? "Try adjusting your search or filters"
              : "No services have been added yet"}
          </p>
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5">
            <p className="text-sm text-[#6B7280]">
              <span className="font-bold text-[#111827]">{total.toLocaleString()}</span> service
              {total !== 1 ? "s" : ""} found
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Page {page} of {totalPages}
            </p>
          </div>

          <div className="animate-admin-scale-in hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Service
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Provider
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Category
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Price Range
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Bookings
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#1E3A5F]">
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

      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-center text-sm text-[#6B7280] sm:text-left">
            Page{" "}
            <span className="font-bold text-[#111827]">{page}</span> of{" "}
            <span className="font-bold text-[#111827]">{totalPages}</span>
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#F5F7F8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
