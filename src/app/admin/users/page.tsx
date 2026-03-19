"use client";

import { useState, useEffect, useCallback } from "react";
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
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
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
  }, [filters]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

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
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">User Management</h2>
        <p className="text-slate-600">Manage seekers and service providers</p>
      </div>

      <UserFilters filters={filters} onFilterChange={setFilters} />
      <UsersTable
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchUsers(p)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    </section>
  );
}