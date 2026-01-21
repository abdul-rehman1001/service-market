'use client';

import Link from 'next/link';

export const AdminSidebar = () => (
  <aside className="w-72 bg-white border-r p-6 hidden md:block">
    <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
    <nav className="space-y-3 text-sm">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/users">Users</Link>
      <Link href="/admin/providers">Providers</Link>
      <Link href="/admin/services">Services</Link>
      <Link href="/admin/bookings">Bookings</Link>
      <Link href="/admin/reviews">Reviews</Link>
    </nav>
  </aside>
);
