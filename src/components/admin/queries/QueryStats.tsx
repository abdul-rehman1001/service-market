"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { QueryStatistics } from "@/app/admin/queries/page";

interface QueryStatsProps {
  statistics: QueryStatistics;
}

export default function QueryStats({ statistics }: QueryStatsProps) {
  const stats = [
    {
      label: "Total Queries",
      value: statistics.total,
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Open",
      value: statistics.open,
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "In Progress",
      value: statistics.inProgress,
      icon: Clock,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Resolved",
      value: statistics.resolved,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Closed",
      value: statistics.closed,
      icon: XCircle,
      color: "bg-slate-100 text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-semibold text-slate-800">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
