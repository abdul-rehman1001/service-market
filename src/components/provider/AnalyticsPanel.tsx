'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

interface BookingData {
  id: string;
  status: string;
  createdAt: string;
  service: {
    title: string;
    baseRate: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10B981',
  IN_PROGRESS: '#059669',
  EN_ROUTE: '#22C55E',
  CONFIRMED: '#1E3A5F',
  CANCELLED: '#EF4444',
  AUTO_CANCELLED: '#F97316',
  PENDING: '#9CA3AF',
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(17, 24, 39, 0.08)',
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'green',
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'green' | 'dark' | 'gold';
}) {
  const styles = {
    green: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]',
      label: 'text-[#6B7280]',
      value: 'text-[#111827]',
    },
    dark: {
      card: 'border-[#E5E7EB] bg-white',
      iconWrap: 'border border-[#E5E7EB] bg-[#1E3A5F] text-white',
      label: 'text-[#6B7280]',
      value: 'text-[#1E3A5F]',
    },
    gold: {
      card: 'border-[#FED7AA] bg-white',
      iconWrap: 'border border-[#FED7AA] bg-[#FEF3C7] text-[#D97706]',
      label: 'text-[#6B7280]',
      value: 'text-[#9A3412]',
    },
  }[accent];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-5 ${styles.card}`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${styles.iconWrap}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <p className={`min-w-0 text-xs font-semibold leading-snug sm:text-sm ${styles.label}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold leading-none sm:text-3xl ${styles.value}`}>{value}</p>
    </div>
  );
}

export const AnalyticsPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    inProgressBookings: 0,
    completionRate: 0,
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }

      const bookingsData = data.bookings || [];
      setBookings(bookingsData);

      const total = bookingsData.length;
      const completed = bookingsData.filter((b: BookingData) => b.status === 'COMPLETED').length;
      const cancelled = bookingsData.filter((b: BookingData) =>
        ['CANCELLED', 'AUTO_CANCELLED'].includes(b.status)
      ).length;
      const inProgress = bookingsData.filter((b: BookingData) =>
        ['IN_PROGRESS', 'EN_ROUTE', 'CONFIRMED'].includes(b.status)
      ).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({
        totalBookings: total,
        completedBookings: completed,
        cancelledBookings: cancelled,
        inProgressBookings: inProgress,
        completionRate,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getStatusDistribution = () => {
    const statusCounts: Record<string, number> = {};
    bookings.forEach((booking) => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value,
      color: STATUS_COLORS[name] || '#9CA3AF',
    }));
  };

  const getMonthlyBookings = () => {
    const monthlyData: Record<string, number> = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-6)
      .map(([month, count]) => ({ month, bookings: count }));
  };

  const statusDistribution = getStatusDistribution();
  const monthlyBookings = getMonthlyBookings();

  const chartHeight = 'h-[220px] min-h-[200px] w-full sm:h-[260px] md:h-[300px]';

  return (
    <section className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#1E3A5F] sm:text-2xl">Analytics</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Track bookings, completion rate, and revenue over time
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-sm transition-all hover:border-[#10B981]/30 hover:bg-[#F5F7F8] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-[#10B981] ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#EF4444]" />
          <p className="text-sm text-[#EF4444]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white py-16 shadow-sm">
          <Loader2 className="h-9 w-9 animate-spin text-[#10B981]" />
          <p className="text-sm text-[#6B7280]">Loading analytics…</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 min-[420px]:[&>*:nth-child(3)]:col-span-2 sm:gap-4 lg:grid-cols-3 lg:[&>*:nth-child(3)]:col-span-1">
            <StatCard label="Total bookings" value={stats.totalBookings} icon={Calendar} accent="green" />
            <StatCard label="Completed" value={stats.completedBookings} icon={CheckCircle2} accent="dark" />
            <StatCard
              label="Completion rate"
              value={`${stats.completionRate}%`}
              icon={TrendingUp}
              accent="gold"
            />
          </div>

          {/* Secondary stats row */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#D1FAE5] bg-[#D1FAE5]/40 px-3 py-1.5 text-xs font-semibold text-[#059669]">
              In progress: {stats.inProgressBookings}
            </span>
            <span className="rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1.5 text-xs font-semibold text-[#EF4444]">
              Cancelled: {stats.cancelledBookings}
            </span>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
            {/* Bookings trend */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] sm:p-5">
              <div className="mb-3 flex items-center gap-3 sm:mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/40">
                  <BarChart3 className="h-4 w-4 text-[#059669]" />
                </div>
                <h3 className="text-base font-bold text-[#1E3A5F] sm:text-lg">Bookings trend</h3>
              </div>
              {monthlyBookings.length > 0 ? (
                <div className={chartHeight}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyBookings} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="month"
                        stroke="#E5E7EB"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke="#E5E7EB"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        allowDecimals={false}
                        width={32}
                      />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        name="Bookings"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6, fill: '#1E3A5F' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart message="No booking data yet" />
              )}
            </div>

            {/* Status pie */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] sm:p-5">
              <div className="mb-3 flex items-center gap-3 sm:mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
                  <PieChartIcon className="h-4 w-4 text-[#1E3A5F]" />
                </div>
                <h3 className="text-base font-bold text-[#1E3A5F] sm:text-lg">Status breakdown</h3>
              </div>
              {statusDistribution.length > 0 ? (
                <div className={chartHeight}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                        formatter={(value) => (
                          <span className="text-[#6B7280]">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart message="No status data yet" />
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 text-center sm:h-[240px]">
      <BarChart3 className="mb-2 h-8 w-8 text-[#D1FAE5]" />
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  );
}
