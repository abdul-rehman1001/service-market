"use client";

import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import type { QueryStatistics } from "@/app/admin/queries/page";

interface QueryStatsProps {
  statistics: QueryStatistics;
  loading?: boolean;
}

export default function QueryStats({ statistics, loading = false }: QueryStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
      <StatCard
        title="Total Queries"
        value={loading ? "—" : statistics.total.toLocaleString()}
        icon={<MessageSquare size={20} />}
        staggerClass="admin-stagger-1"
      />
      <StatCard
        title="Open"
        value={loading ? "—" : statistics.open.toLocaleString()}
        icon={<AlertCircle size={20} />}
        staggerClass="admin-stagger-2"
      />
      <StatCard
        title="In Progress"
        value={loading ? "—" : statistics.inProgress.toLocaleString()}
        icon={<Clock size={20} />}
        staggerClass="admin-stagger-3"
      />
      <StatCard
        title="Resolved"
        value={loading ? "—" : statistics.resolved.toLocaleString()}
        icon={<CheckCircle size={20} />}
        staggerClass="admin-stagger-4"
      />
      <StatCard
        title="Closed"
        value={loading ? "—" : statistics.closed.toLocaleString()}
        icon={<XCircle size={20} />}
        staggerClass="admin-stagger-5"
      />
    </div>
  );
}
