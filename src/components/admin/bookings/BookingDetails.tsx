"use client";

export default function BookingDetails() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Booking Information</h2>
        <p className="text-sm text-gray-600 mt-1">B-1001</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Service</h3>
          <p className="text-sm text-gray-600 mt-1">Bathroom Plumbing Repair</p>

          <h3 className="font-medium mt-2">Seeker</h3>
          <p className="text-sm text-gray-600 mt-1">Sara Ahmed</p>
        </div>

        <div>
          <h3 className="font-medium">Provider</h3>
          <p className="text-sm text-gray-600 mt-1">Ali Khan</p>

          <h3 className="font-medium mt-2">Date</h3>
          <p className="text-sm text-gray-600 mt-1">15 Jan 2026</p>
        </div>
      </div>

      {/* Admin Override Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          Mark as Completed
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Cancel Booking
        </button>
      </div>
    </div>
  );
}
