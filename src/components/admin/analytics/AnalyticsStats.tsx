import { Users, ShieldCheck, Calendar, Layers } from "lucide-react";
import StatCard from "@/components/admin/StatCard";

export default function AnalyticsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Users" value="12,450" icon={<Users />} />
      <StatCard title="Providers" value="3,280" icon={<ShieldCheck />} />
      <StatCard title="Bookings" value="21,940" icon={<Calendar />} />
      <StatCard title="Categories" value="42" icon={<Layers />} />
    </div>
  );
}
