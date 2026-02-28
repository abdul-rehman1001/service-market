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
} from "lucide-react";
import AnalyticsCharts from "@/components/admin/analytics/AnalyticsCharts";
import PopularCategories from "@/components/admin/analytics/PopularCategories";
import ExportButtons from "@/components/admin/analytics/ExportButtons";
import StatCard from "@/components/admin/StatCard";

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
      const res = await fetch(
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
      <section className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="p-6">
        <p className="text-red-500">Failed to load analytics data.</p>
      </section>
    );
  }

  const { stats } = data;

  return (
    <section className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-slate-600">Platform-wide overview &amp; reports</p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={22} />}
        />
        <StatCard
          title="Service Providers"
          value={stats.totalProviders.toLocaleString()}
          icon={<ShieldCheck size={22} />}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={<Calendar size={22} />}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories.toLocaleString()}
          icon={<Layers size={22} />}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings.toLocaleString()}
          icon={<Activity size={22} />}
        />
        <StatCard
          title="This Month Bookings"
          value={stats.thisMonthBookings.toLocaleString()}
          icon={<TrendingUp size={22} />}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString()}
          icon={<Star size={22} />}
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts
        bookingTrends={data.bookingTrends}
        userGrowth={data.userGrowth}
        statusDistribution={data.statusDistribution}
        trendPeriod={trendPeriod}
        onTrendPeriodChange={setTrendPeriod}
        loading={loading}
      />

      {/* Popular Categories */}
      <PopularCategories categories={data.popularCategories} />

      {/* Export */}
      <ExportButtons data={data} />
    </section>
  );
}
