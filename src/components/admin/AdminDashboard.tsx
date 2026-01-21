'use client';

import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { StatCard } from './StatCard';
import { BookingChart } from './Charts/BookingChart';
import { RevenueChart } from './Charts/RevenueChart';

export const AdminDashboard = () => (
  <div className="flex min-h-screen bg-gray-50">
    <AdminSidebar />
    <main className="flex-1">
      <AdminHeader />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={1240} />
          <StatCard title="Providers" value={320} />
          <StatCard title="Bookings Today" value={58} />
          <StatCard title="Revenue" value="$4,200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BookingChart />
          <RevenueChart />
        </div>
      </div>
    </main>
  </div>
);
