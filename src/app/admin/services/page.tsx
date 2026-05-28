"use client";

import ServicesTable from "@/components/admin/services/ServicesTable";
import { Wrench } from "lucide-react";

export default function ServicesPage() {
  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <Wrench size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Service Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
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
