"use client";

export default function ReviewDetails() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review Information</h2>
        <p className="text-sm text-gray-600 mt-1">R-3001</p>
      </div>

      <div>
        <h3 className="font-medium">Service</h3>
        <p className="text-sm text-gray-600 mt-1">Bathroom Plumbing Repair</p>
      </div>

      <div>
        <h3 className="font-medium">Reviewer</h3>
        <p className="text-sm text-gray-600 mt-1">Sara Ahmed</p>
      </div>

      <div>
        <h3 className="font-medium">Provider Comments</h3>
        <p className="text-sm text-gray-600 mt-1">Good quality work.</p>
      </div>

      <div>
        <h3 className="font-medium">Rating</h3>
        <p className="text-sm text-gray-600 mt-1">4 / 5</p>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          Mark Visible
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Delete Review
        </button>
      </div>
    </div>
  );
}
