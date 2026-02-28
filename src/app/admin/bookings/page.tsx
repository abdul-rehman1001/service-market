"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function AdminBookingsPage() {
  const [filters, setFilters] = useState<BookingFiltersState>(defaultFilters);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async (page = 1) => {
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
  }, [filters]);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

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
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Booking Management</h2>
        <p className="text-slate-600">View and manage all bookings across the platform</p>
      </div>

      <BookingFilters filters={filters} onFilterChange={setFilters} />
      <BookingsTable
        bookings={bookings}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchBookings(p)}
        onCancel={handleCancel}
      />
    </section>
  );
}
