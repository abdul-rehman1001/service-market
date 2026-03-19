"use client";

import ServicesTable from "@/components/admin/services/ServicesTable";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Service Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            View, edit, and manage all services added by providers
          </p>
        </div>
      </div>

      <ServicesTable />
    </div>
  );
}
