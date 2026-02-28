"use client";

import { useState, useEffect, useCallback } from "react";
import ReviewsTable from "@/components/admin/reviews/ReviewsTable";
import ReviewFilters from "@/components/admin/reviews/ReviewFilters";

export interface ReviewFiltersState {
  search: string;
  rating: string;
  dateFrom: string;
  dateTo: string;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  professionalism: number | null;
  punctuality: number | null;
  qualityOfWork: number | null;
  communication: number | null;
  valueForMoney: number | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  reviewee: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage: string | null;
  };
  booking: {
    id: string;
    bookingNumber: string;
    service: {
      id: string;
      name: string;
      category: { name: string };
    };
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const defaultFilters: ReviewFiltersState = {
  search: "",
  rating: "",
  dateFrom: "",
  dateTo: "",
};

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState<ReviewFiltersState>(defaultFilters);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filters.search) params.set("search", filters.search);
      if (filters.rating) params.set("rating", filters.rating);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleDelete = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      fetchReviews(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Review Management</h2>
        <p className="text-slate-600">Monitor and manage all service reviews</p>
      </div>

      <ReviewFilters filters={filters} onFilterChange={setFilters} />
      <ReviewsTable
        reviews={reviews}
        loading={loading}
        pagination={pagination}
        onPageChange={(p) => fetchReviews(p)}
        onDelete={handleDelete}
      />
    </section>
  );
}
