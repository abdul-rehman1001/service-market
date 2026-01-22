

import { Users, ShieldCheck, Calendar, Layers } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import ChartPlaceholder from "@/components/admin/Charts/ChartPlaceholder";


export default function AdminDashboardPage() {
return (
<section className="space-y-8">
<div>
<h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
<p className="text-slate-600">Platform-wide overview</p>
</div>


{/* KPI Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
<StatCard title="Total Users" value="12,450" icon={<Users />} />
<StatCard title="Providers" value="3,280" icon={<ShieldCheck />} />
<StatCard title="Bookings" value="21,940" icon={<Calendar />} />
<StatCard title="Categories" value="42" icon={<Layers />} />
</div>


{/* Charts */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<ChartPlaceholder title="Booking Trends (Daily / Monthly)" />
<ChartPlaceholder title="User Growth Over Time" />
</div>


{/* Popular Categories */}
<div className="bg-white rounded-xl shadow-sm p-6">
<h3 className="font-semibold mb-4">Most Popular Categories</h3>
<ul className="space-y-3">
{["Home Cleaning", "Electrician", "Plumbing", "AC Repair"].map((c) => (
<li key={c} className="flex justify-between">
<span>{c}</span>
<span className="text-emerald-600 font-medium">+12%</span>
</li>
))}
</ul>
</div>
</section>
);
}