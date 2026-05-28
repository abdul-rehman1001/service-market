"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
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
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(
    async (page = 1) => {
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
    },
    [filters]
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const pageStats = useMemo(() => {
    if (reviews.length === 0) return { avgRating: "—", fiveStar: 0, withComment: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const withComment = reviews.filter((r) => r.comment?.trim()).length;
    return {
      avgRating: avg.toFixed(1),
      fiveStar,
      withComment,
    };
  }, [reviews]);

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
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <Star size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Review Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              Monitor and manage all service reviews across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[var(--admin-beige)]/60 bg-white/80 px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[var(--admin-green-dark)]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[var(--admin-green)]/70">reviews total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          {
            label: "Total",
            value: loading ? "—" : pagination.total.toLocaleString(),
            icon: Star,
            stagger: "admin-stagger-1",
          },
          {
            label: "Avg Rating (page)",
            value: loading ? "—" : pageStats.avgRating,
            icon: ThumbsUp,
            stagger: "admin-stagger-2",
          },
          {
            label: "5-Star (page)",
            value: loading ? "—" : pageStats.fiveStar,
            icon: Star,
            stagger: "admin-stagger-3",
          },
          {
            label: "With Comment (page)",
            value: loading ? "—" : pageStats.withComment,
            icon: MessageSquare,
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
        <ReviewFilters filters={filters} onFilterChange={setFilters} />
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-3">
        <ReviewsTable
          reviews={reviews}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => fetchReviews(p)}
          onDelete={handleDelete}
        />
      </div>
    </section>
  );
}
