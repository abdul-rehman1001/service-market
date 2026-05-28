"use client";

import ContentTabs from "@/components/admin/content/ContentTabs";
import { FileText } from "lucide-react";

export default function ContentPage() {
  return (
    <section className="space-y-5 md:space-y-7">
      <div className="animate-admin-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="hidden rounded-2xl bg-[var(--admin-green)] p-3 text-white shadow-lg sm:block">
            <FileText size={26} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--admin-green-dark)] sm:text-3xl">
              Content Management
            </h2>
            <p className="mt-1 text-sm text-[var(--admin-green)]/75 sm:text-base">
              Edit and publish platform pages &amp; FAQ content
            </p>
          </div>
        </div>
      </div>

      <div className="animate-admin-fade-in-up admin-stagger-2">
        <ContentTabs />
      </div>
    </section>
  );
}
