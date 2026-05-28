"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Loader2 } from "lucide-react";

interface BookingTrend {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
}

interface UserGrowthPoint {
  month: string;
  seekers: number;
  providers: number;
  total: number;
}

interface StatusEntry {
  status: string;
  count: number;
}

interface AnalyticsChartsProps {
  bookingTrends: BookingTrend[];
  userGrowth: UserGrowthPoint[];
  statusDistribution: StatusEntry[];
  trendPeriod: "daily" | "weekly" | "monthly";
  onTrendPeriodChange: (period: "daily" | "weekly" | "monthly") => void;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  HOLD: "#94a3b8",
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  EN_ROUTE: "#8b5cf6",
  IN_PROGRESS: "#06b6d4",
  COMPLETED: "#2fa084",
  CANCELLED: "#ef4444",
  AUTO_CANCELLED: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  HOLD: "Hold",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  EN_ROUTE: "En Route",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  AUTO_CANCELLED: "Auto Cancelled",
};

const CHART_GREEN = "#2fa084";
const CHART_GREEN_DARK = "#1f6f5f";
const CHART_ACCENT = "#6fcf97";

function formatLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[parseInt(parts[1]) - 1] || parts[1];
  if (parts.length === 2) return `${month} ${parts[0].slice(2)}`;
  return `${month} ${parseInt(parts[2])}`;
}

export default function AnalyticsCharts({
  bookingTrends,
  userGrowth,
  statusDistribution,
  trendPeriod,
  onTrendPeriodChange,
  loading,
}: AnalyticsChartsProps) {
  const periodOptions: { value: "daily" | "weekly" | "monthly"; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Booking Trends */}
      <div className="admin-card rounded-2xl p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">Booking Trends</h3>
          <div className="flex gap-1 self-start rounded-xl bg-[var(--admin-beige)]/40 p-1 sm:self-auto">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onTrendPeriodChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  trendPeriod === opt.value
                    ? "bg-[var(--admin-green)] text-white shadow-sm"
                    : "text-[var(--admin-green-dark)]/70 hover:bg-white/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center sm:h-72">
            <Loader2 className="animate-spin text-[var(--admin-green)]" size={28} />
          </div>
        ) : bookingTrends.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-[var(--admin-green)]/50 sm:h-72">
            No booking data available for this period
          </div>
        ) : (
          <div className="h-64 w-full sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_ACCENT} />
                <XAxis dataKey="date" tickFormatter={formatLabel} fontSize={12} stroke={CHART_GREEN_DARK} />
                <YAxis fontSize={12} stroke={CHART_GREEN_DARK} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={((label: any) => formatLabel(String(label))) as any}
                  contentStyle={{
                    borderRadius: "12px",
                    border: `1px solid ${CHART_ACCENT}`,
                    boxShadow: "0 4px 16px rgba(31, 111, 95, 0.1)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total"
                  dot={false}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  name="Completed"
                  dot={false}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Cancelled"
                  dot={false}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* User Growth + Status Distribution */}
      <div className="grid grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2">
        <div className="admin-card rounded-2xl p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-[var(--admin-green-dark)]">
            User Growth (Last 12 Months)
          </h3>
          {userGrowth.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-[var(--admin-green)]/50 sm:h-72">
              No user growth data available
            </div>
          ) : (
            <div className="h-64 w-full sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_ACCENT} />
                  <XAxis dataKey="month" tickFormatter={formatLabel} fontSize={12} stroke={CHART_GREEN_DARK} />
                  <YAxis fontSize={12} stroke={CHART_GREEN_DARK} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    labelFormatter={((label: any) => formatLabel(String(label))) as any}
                    contentStyle={{
                      borderRadius: "12px",
                      border: `1px solid ${CHART_ACCENT}`,
                      boxShadow: "0 4px 16px rgba(13, 83, 14, 0.08)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="seekers" fill="#3b82f6" name="Seekers" radius={[6, 6, 0, 0]} animationDuration={800} />
                  <Bar dataKey="providers" fill={CHART_GREEN} name="Providers" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="admin-card rounded-2xl p-4 sm:p-6">
          <h3 className="mb-4 text-lg font-bold text-[var(--admin-green-dark)]">
            Booking Status Distribution
          </h3>
          {statusDistribution.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-[var(--admin-green)]/50 sm:h-72">
              No booking data available
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-56 w-full sm:h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                      animationDuration={800}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      label={((props: any) =>
                        `${STATUS_LABELS[props.name] || props.name}: ${props.value}`
                      ) as any}
                      labelLine={false}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={((value: any, name: any) => {
                        return [value, STATUS_LABELS[name] || name];
                      }) as any}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-3">
                {statusDistribution.map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.status] || "#94a3b8" }}
                    />
                    <span className="text-[var(--admin-green-dark)]/75">
                      {STATUS_LABELS[entry.status] || entry.status} ({entry.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
