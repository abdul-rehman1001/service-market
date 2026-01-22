"use client";

import QueryFilters from "@/components/admin/queries/QueryFilters";
import QueriesTable from "@/components/admin/queries/QueriesTable";

export default function QueriesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User Queries & Complaints</h1>
      <p className="text-slate-600">
        View, filter, and respond to user-submitted queries
      </p>

      <QueryFilters />
      <QueriesTable />
    </div>
  );
}
