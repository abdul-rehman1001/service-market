"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Star,
  Activity,
  TrendingUp,
  Loader2,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import AnalyticsCharts from "@/components/admin/analytics/AnalyticsCharts";
import PopularCategories from "@/components/admin/analytics/PopularCategories";
import ExportButtons from "@/components/admin/analytics/ExportButtons";
import StatCard from "@/components/admin/StatCard";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

export interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalProviders: number;
    totalBookings: number;
    activeBookings: number;
    thisMonthBookings: number;
    totalCategories: number;
    totalReviews: number;
  };
  bookingTrends: { date: string; total: number; completed: number; cancelled: number }[];
  userGrowth: { month: string; seekers: number; providers: number; total: number }[];
  popularCategories: { id: string; name: string; bookings: number }[];
  statusDistribution: { status: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(
        `/api/admin/analytics?trendPeriod=${trendPeriod}&growthMonths=12`
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [trendPeriod]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !data) {
    return (
      <section className="flex h-72 flex-col items-center justify-center gap-4 sm:h-96">
        <Loader2 className="animate-spin text-[#10B981]" size={44} />
        <p className="text-sm font-medium text-[#6B7280] animate-admin-fade-in-up">
          Loading analytics…
        </p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="admin-card animate-admin-scale-in rounded-2xl p-6">
        <p className="text-[#EF4444]">Failed to load analytics data.</p>
      </section>
    );
  }

  const { stats } = data;

  return (
    <section className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="animate-admin-fade-in-up flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/60 text-[#059669] sm:flex">
            <BarChart3 size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-[#1E3A5F] sm:text-3xl">
              Analytics Dashboard
            </h2>
            <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
              Platform-wide overview &amp; reports
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-all hover:border-[#10B981]/30 hover:bg-[#F5F7F8] disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={16} className={`text-[#10B981] ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={22} />}
          staggerClass="admin-stagger-1"
        />
        <StatCard
          title="Service Providers"
          value={stats.totalProviders.toLocaleString()}
          icon={<ShieldCheck size={22} />}
          staggerClass="admin-stagger-2"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={<Calendar size={22} />}
          staggerClass="admin-stagger-3"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories.toLocaleString()}
          icon={<Layers size={22} />}
          staggerClass="admin-stagger-4"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings.toLocaleString()}
          icon={<Activity size={22} />}
          staggerClass="admin-stagger-5"
        />
        <StatCard
          title="This Month Bookings"
          value={stats.thisMonthBookings.toLocaleString()}
          icon={<TrendingUp size={22} />}
          staggerClass="admin-stagger-6"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString()}
          icon={<Star size={22} />}
          staggerClass="admin-stagger-7"
        />
      </div>

      {/* Charts */}
      <div className="animate-admin-fade-in-up admin-stagger-4">
        <AnalyticsCharts
          bookingTrends={data.bookingTrends}
          userGrowth={data.userGrowth}
          statusDistribution={data.statusDistribution}
          trendPeriod={trendPeriod}
          onTrendPeriodChange={setTrendPeriod}
          loading={loading}
        />
      </div>

      {/* Popular Categories */}
      <div className="animate-admin-fade-in-up admin-stagger-5">
        <PopularCategories categories={data.popularCategories} />
      </div>

      {/* Export */}
      <div className="animate-admin-fade-in-up admin-stagger-6">
        <ExportButtons data={data} />
      </div>
    </section>
  );
}
