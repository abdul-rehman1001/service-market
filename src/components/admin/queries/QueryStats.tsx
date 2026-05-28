"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Timer } from "lucide-react";
import type { QueryStatistics } from "@/app/admin/queries/page";

interface QueryStatsProps {
  statistics: QueryStatistics;
}

export default function QueryStats({ statistics }: QueryStatsProps) {
  const stats = [
    {
      label: "Total Queries",
      value: statistics.total.toLocaleString(),
      icon: MessageSquare,
      stagger: "admin-stagger-1",
    },
    {
      label: "Open",
      value: statistics.open.toLocaleString(),
      icon: AlertCircle,
      stagger: "admin-stagger-2",
    },
    {
      label: "In Progress",
      value: statistics.inProgress.toLocaleString(),
      icon: Clock,
      stagger: "admin-stagger-3",
    },
    {
      label: "Resolved",
      value: statistics.resolved.toLocaleString(),
      icon: CheckCircle,
      stagger: "admin-stagger-4",
    },
    {
      label: "Closed",
      value: statistics.closed.toLocaleString(),
      icon: XCircle,
      stagger: "admin-stagger-5",
    },
    {
      label: "Avg Response",
      value:
        statistics.avgResponseTimeHours > 0
          ? `${statistics.avgResponseTimeHours}h`
          : "N/A",
      icon: Timer,
      stagger: "admin-stagger-6",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`admin-card animate-admin-fade-in-up ${stat.stagger} flex items-center gap-3 rounded-2xl p-4`}
          >
            <div className="rounded-xl bg-[var(--admin-green-muted)] p-2.5 text-[var(--admin-green)]">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[var(--admin-green)]/70">
                {stat.label}
              </p>
              <p className="text-lg font-bold text-[var(--admin-green-dark)] sm:text-xl">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
