"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import QueryFilters from "@/components/admin/queries/QueryFilters";
import QueriesTable from "@/components/admin/queries/QueriesTable";
import QueryStats from "@/components/admin/queries/QueryStats";
import QueryExport from "@/components/admin/queries/QueryExport";

export interface AdminQuery {
  id: string;
  queryNumber: string;
  subject: string;
  message: string;
  queryType: string;
  status: string;
  bookingId: string | null;
  adminReply: string | null;
  repliedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    profileImage: string | null;
  };
}

export interface QueryFiltersState {
  search: string;
  status: string;
  queryType: string;
  userType: string;
  dateFrom: string;
  dateTo: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTimeHours: number;
}

export default function QueriesPage() {
  const [queries, setQueries] = useState<AdminQuery[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statistics, setStatistics] = useState<QueryStatistics>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResponseTimeHours: 0,
  });
  const [filters, setFilters] = useState<QueryFiltersState>({
    search: "",
    status: "",
    queryType: "",
    userType: "",
    dateFrom: "",
    dateTo: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchQueries = useCallback(
    async (pg = pagination.page) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", pg.toString());
        params.set("limit", pagination.limit.toString());
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);
        if (filters.queryType) params.set("queryType", filters.queryType);
        if (filters.userType) params.set("userType", filters.userType);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await fetch(`/api/admin/queries?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setQueries(data.queries);
          setPagination(data.pagination);
          setStatistics(data.statistics);
        }
      } catch (err) {
        console.error("Failed to fetch queries:", err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, pagination.limit]
  );

  useEffect(() => {
    fetchQueries(1);
  }, [fetchQueries]);

  const handlePageChange = (newPage: number) => {
    fetchQueries(newPage);
  };

  const handleFiltersChange = (newFilters: QueryFiltersState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "",
      queryType: "",
      userType: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <HelpCircle size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Query &amp; Complaint Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              View, respond to, and manage user queries and complaints
            </p>
          </div>
        </div>
        <div className="animate-admin-scale-in shrink-0">
          <QueryExport queries={queries} statistics={statistics} />
        </div>
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-1">
        <QueryStats statistics={statistics} />
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-2">
        <QueryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-3">
        {loading && queries.length === 0 ? (
          <div className="admin-card flex flex-col items-center justify-center gap-3 rounded-2xl p-16">
            <Loader2 className="animate-spin text-[var(--admin-green)]" size={36} />
            <p className="text-sm font-medium text-[var(--admin-green)]/70">Loading queries…</p>
          </div>
        ) : (
          <QueriesTable
            queries={queries}
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </section>
  );
}
