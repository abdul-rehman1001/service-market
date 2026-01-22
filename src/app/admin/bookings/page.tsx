"use client";

import BookingsTable from "@/components/admin/bookings/BookingsTable";

export default function BookingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Bookings Management</h1>
      <p className="text-slate-600">View and manage all bookings</p>

      <BookingsTable />
    </div>
  );
}
