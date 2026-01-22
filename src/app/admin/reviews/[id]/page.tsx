"use client";

import ReviewDetails from "@/components/admin/reviews/ReviewDetails";

export default function ReviewDetailPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Review Details</h1>
      <ReviewDetails />
    </div>
  );
}
