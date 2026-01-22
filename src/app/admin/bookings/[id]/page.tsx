"use client";

import BookingDetails from "@/components/admin/bookings/BookingDetails";

export default function BookingDetailPage() {
  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Booking Detail</h1>
      <BookingDetails />
    </div>
  );
}
