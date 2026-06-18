"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Users, UserCheck, Briefcase, UserRound } from "lucide-react";
import UsersTable from "@/components/admin/tables/UsersTable";
import UserFilters from "@/components/admin/filters/UserFilters";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export interface UserFiltersState {
  search: string;
  role: string;
  status: string;
  verification: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  profileImage: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  providerProfile: { verificationStatus: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const defaultFilters: UserFiltersState = {
  search: "",
  role: "",
  status: "",
  verification: "",
  dateFrom: "",
  dateTo: "",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFiltersState>(defaultFilters);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.search) params.set("search", filters.search);
        if (filters.role) params.set("role", filters.role);
        if (filters.status) params.set("status", filters.status);
        if (filters.verification) params.set("verification", filters.verification);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await authenticatedFetch(`/api/admin/users?${params.toString()}`, {
          cache: "no-store",
        });

        if (res.status === 401) {
          router.push("/login?next=/admin/users");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to fetch users");
          return;
        }

        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filters, router]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const pageStats = useMemo(() => {
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const providers = users.filter((u) => u.role === "PROVIDER").length;
    const seekers = users.filter((u) => u.role === "SEEKER").length;
    return { active, providers, seekers };
  }, [users]);

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401) {
        router.push("/login?next=/admin/users");
        return;
      }
      if (!res.ok) {
        setError("Failed to update user status");
        return;
      }
      fetchUsers(pagination.page);
    } catch {
      setError("Failed to update user status");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login?next=/admin/users");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete user");
        return;
      }
      fetchUsers(pagination.page);
    } catch {
      setError("Failed to delete user");
    }
  };

  return (
    <section className="space-y-5 md:space-y-7">
      {/* Page header */}
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">User Management</h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              Manage seekers and service providers across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[#111827]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[#6B7280]">users total</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loading ? "—" : pagination.total.toLocaleString()}
          icon={<Users size={20} />}
          staggerClass="admin-stagger-1"
        />
        <StatCard
          title="Active (page)"
          value={loading ? "—" : pageStats.active}
          icon={<UserCheck size={20} />}
          staggerClass="admin-stagger-2"
        />
        <StatCard
          title="Providers (page)"
          value={loading ? "—" : pageStats.providers}
          icon={<Briefcase size={20} />}
          staggerClass="admin-stagger-3"
        />
        <StatCard
          title="Seekers (page)"
          value={loading ? "—" : pageStats.seekers}
          icon={<UserRound size={20} />}
          staggerClass="admin-stagger-4"
        />
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      <div className="animate-admin-fade-in-up admin-stagger-2">
        <UserFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-3">
        <UsersTable
          users={users}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => fetchUsers(p)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}
