"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import BookingFilters from "@/components/admin/bookings/BookingFilters";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export interface BookingFiltersState {
  search: string;
  status: string;
  categoryId: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminBooking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  cancelledBy: string | null;
  createdAt: string;
  service: {
    id: string;
    name: string;
    category: { id: string; name: string };
  };
  seeker: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  provider: {
    id: string;
    businessName: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImage: string | null;
    };
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const defaultFilters: BookingFiltersState = {
  search: "",
  status: "",
  categoryId: "",
  dateFrom: "",
  dateTo: "",
};

const ACTIVE_STATUSES = ["HOLD", "PENDING", "CONFIRMED", "EN_ROUTE", "IN_PROGRESS"];

export default function AdminBookingsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<BookingFiltersState>(defaultFilters);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);
        if (filters.categoryId) params.set("categoryId", filters.categoryId);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await authenticatedFetch(`/api/admin/bookings?${params.toString()}`, {
          cache: "no-store",
        });

        if (res.status === 401) {
          router.push("/login?next=/admin/bookings");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to fetch bookings");
          return;
        }

        const data = await res.json();
        setBookings(data.bookings);
        setPagination(data.pagination);
      } catch {
        setError("Failed to fetch bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filters, router]
  );

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const pageStats = useMemo(() => {
    const active = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const cancelled = bookings.filter(
      (b) => b.status === "CANCELLED" || b.status === "AUTO_CANCELLED"
    ).length;
    return { active, completed, cancelled };
  }, [bookings]);

  const handleCancel = async (bookingId: string, reason: string) => {
    try {
      const res = await authenticatedFetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/bookings");
        return;
      }

      if (!res.ok) {
        setError("Failed to cancel booking");
        return;
      }

      fetchBookings(pagination.page);
    } catch {
      setError("Failed to cancel booking. Please try again.");
    }
  };

  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <Calendar size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">Booking Management</h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              View and manage all bookings across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[#111827]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[#6B7280]">bookings total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title="Total Bookings"
          value={loading ? "—" : pagination.total.toLocaleString()}
          icon={<Calendar size={20} />}
          staggerClass="admin-stagger-1"
        />
        <StatCard
          title="Active (page)"
          value={loading ? "—" : pageStats.active}
          icon={<Clock size={20} />}
          staggerClass="admin-stagger-2"
        />
        <StatCard
          title="Completed (page)"
          value={loading ? "—" : pageStats.completed}
          icon={<CheckCircle size={20} />}
          staggerClass="admin-stagger-3"
        />
        <StatCard
          title="Cancelled (page)"
          value={loading ? "—" : pageStats.cancelled}
          icon={<XCircle size={20} />}
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
        <BookingFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-3">
        <BookingsTable
          bookings={bookings}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => fetchBookings(p)}
          onCancel={handleCancel}
        />
      </div>
    </section>
  );
}
