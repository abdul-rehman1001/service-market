"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, UserCheck, Briefcase } from "lucide-react";
import UsersTable from "@/components/admin/tables/UsersTable";
import UserFilters from "@/components/admin/filters/UserFilters";

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
  const [filters, setFilters] = useState<UserFiltersState>(defaultFilters);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
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

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
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
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="space-y-5 md:space-y-7">
      {/* Page header */}
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <Users size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              User Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              Manage seekers and service providers across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[var(--admin-beige)]/60 bg-white/80 px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[var(--admin-green-dark)]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[var(--admin-green)]/70">users total</span>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          {
            label: "Total Users",
            value: loading ? "—" : pagination.total.toLocaleString(),
            icon: Users,
            stagger: "admin-stagger-1",
          },
          {
            label: "Active (page)",
            value: loading ? "—" : pageStats.active,
            icon: UserCheck,
            stagger: "admin-stagger-2",
          },
          {
            label: "Providers (page)",
            value: loading ? "—" : pageStats.providers,
            icon: Briefcase,
            stagger: "admin-stagger-3",
          },
          {
            label: "Seekers (page)",
            value: loading ? "—" : pageStats.seekers,
            icon: Users,
            stagger: "admin-stagger-4",
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
