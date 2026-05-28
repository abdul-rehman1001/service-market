"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import BookingsTable from "@/components/admin/bookings/BookingsTable";
import BookingFilters from "@/components/admin/bookings/BookingFilters";

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
  const [filters, setFilters] = useState<BookingFiltersState>(defaultFilters);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);
        if (filters.categoryId) params.set("categoryId", filters.categoryId);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await fetch(`/api/admin/bookings?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data.bookings);
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
      const res = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      fetchBookings(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <Calendar size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Booking Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              View and manage all bookings across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[var(--admin-beige)]/60 bg-white/80 px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[var(--admin-green-dark)]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[var(--admin-green)]/70">bookings total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          {
            label: "Total",
            value: loading ? "—" : pagination.total.toLocaleString(),
            icon: Calendar,
            stagger: "admin-stagger-1",
          },
          {
            label: "Active (page)",
            value: loading ? "—" : pageStats.active,
            icon: Clock,
            stagger: "admin-stagger-2",
          },
          {
            label: "Completed (page)",
            value: loading ? "—" : pageStats.completed,
            icon: CheckCircle,
            stagger: "admin-stagger-3",
          },
          {
            label: "Cancelled (page)",
            value: loading ? "—" : pageStats.cancelled,
            icon: XCircle,
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
              <p className="truncate text-xs font-medium text-[var(--admin-green)]/70">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-[var(--admin-green-dark)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

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
