"use client";

import AnalyticsStats from "@/components/admin/analytics/AnalyticsStats";
import AnalyticsCharts from "@/components/admin/analytics/AnalyticsCharts";
import PopularCategories from "@/components/admin/analytics/PopularCategories";
import ExportButtons from "@/components/admin/analytics/ExportButtons";

export default function AnalyticsPage() {
  return (
    <section className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-slate-600">Platform-wide overview</p>
      </div>

      <AnalyticsStats />
      <AnalyticsCharts />
      <PopularCategories />
      <ExportButtons />
    </section>
  );
}
