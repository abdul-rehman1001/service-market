"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Star, MessageSquare, ThumbsUp } from "lucide-react";
import ReviewsTable from "@/components/admin/reviews/ReviewsTable";
import ReviewFilters from "@/components/admin/reviews/ReviewFilters";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

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
  const router = useRouter();
  const [filters, setFilters] = useState<ReviewFiltersState>(defaultFilters);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.search) params.set("search", filters.search);
        if (filters.rating) params.set("rating", filters.rating);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);

        const res = await authenticatedFetch(`/api/admin/reviews?${params.toString()}`, {
          cache: "no-store",
        });

        if (res.status === 401) {
          router.push("/login?next=/admin/reviews");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to fetch reviews");
          return;
        }

        const data = await res.json();
        setReviews(data.reviews);
        setPagination(data.pagination);
      } catch {
        setError("Failed to fetch reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [filters, router]
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
      const res = await authenticatedFetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/login?next=/admin/reviews");
        return;
      }

      if (!res.ok) {
        setError("Failed to delete review");
        return;
      }

      fetchReviews(pagination.page);
    } catch {
      setError("Failed to delete review. Please try again.");
    }
  };

  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <Star size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">Review Management</h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              Monitor and manage all service reviews across the platform
            </p>
          </div>
        </div>
        {!loading && (
          <div className="animate-admin-scale-in self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm shadow-sm">
            <span className="font-bold text-[#111827]">
              {pagination.total.toLocaleString()}
            </span>
            <span className="ml-1 text-[#6B7280]">reviews total</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
        <StatCard
          title="Total Reviews"
          value={loading ? "—" : pagination.total.toLocaleString()}
          icon={<Star size={20} />}
          staggerClass="admin-stagger-1"
        />
        <StatCard
          title="Avg Rating (page)"
          value={loading ? "—" : pageStats.avgRating}
          icon={<ThumbsUp size={20} />}
          staggerClass="admin-stagger-2"
        />
        <StatCard
          title="5-Star (page)"
          value={loading ? "—" : pageStats.fiveStar}
          icon={<Star size={20} />}
          staggerClass="admin-stagger-3"
        />
        <StatCard
          title="With Comment (page)"
          value={loading ? "—" : pageStats.withComment}
          icon={<MessageSquare size={20} />}
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
