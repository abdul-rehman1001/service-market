"use client";

import ServicesTable from "@/components/admin/services/ServicesTable";
import { Wrench } from "lucide-react";

export default function ServicesPage() {
  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <Wrench size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">Service Management</h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              View, edit, and manage all services added by providers
            </p>
          </div>
        </div>
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-2">
        <ServicesTable />
      </div>
    </section>
  );
}
