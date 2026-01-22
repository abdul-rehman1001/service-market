"use client";

import ReviewsTable from "@/components/admin/reviews/ReviewsTable";

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Review Management</h1>
      <p className="text-slate-600">Manage all service reviews</p>

      <ReviewsTable />
    </div>
  );
}
