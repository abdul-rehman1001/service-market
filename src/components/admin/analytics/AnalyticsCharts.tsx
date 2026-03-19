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
  COMPLETED: "#10b981",
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

function formatLabel(dateStr: string): string {
  // "2025-01" → "Jan 25", "2025-01-15" → "Jan 15"
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
    <div className="space-y-6">
      {/* Booking Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Booking Trends</h3>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onTrendPeriodChange(opt.value)}
                className={`px-3 py-1 text-xs rounded-md transition ${
                  trendPeriod === opt.value
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={28} />
          </div>
        ) : bookingTrends.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-400">
            No booking data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tickFormatter={formatLabel} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={((label: any) => formatLabel(String(label))) as any}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                name="Completed"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                stroke="#ef4444"
                strokeWidth={2}
                name="Cancelled"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* User Growth + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">User Growth (Last 12 Months)</h3>
          {userGrowth.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400">
              No user growth data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tickFormatter={formatLabel} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={((label: any) => formatLabel(String(label))) as any}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="seekers" fill="#3b82f6" name="Seekers" radius={[4, 4, 0, 0]} />
                <Bar dataKey="providers" fill="#10b981" name="Providers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Booking Status Distribution</h3>
          {statusDistribution.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400">
              No booking data available
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
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
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {statusDistribution.map((entry) => (
                  <div key={entry.status} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[entry.status] || "#94a3b8" }}
                    />
                    <span className="text-slate-600">
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
