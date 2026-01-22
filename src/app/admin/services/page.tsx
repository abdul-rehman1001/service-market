"use client";

import ServicesTable from "@/components/admin/services/ServicesTable";

export default function ServicesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl  color font-semibold">Services</h1>
      <ServicesTable />
    </div>
  );
}
