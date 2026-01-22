"use client";

import ServiceDetails from "@/components/admin/services/ServiceDetails";

export default function ServiceReviewPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Service Review</h1>
      <ServiceDetails />
    </div>
  );
}
