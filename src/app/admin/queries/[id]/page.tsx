"use client";

import QueryDetails from "@/components/admin/queries/QueryDetails";

export default function QueryDetailPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Query Details</h1>
      <QueryDetails />
    </div>
  );
}
