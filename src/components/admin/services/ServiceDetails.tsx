"use client";

export default function ServiceDetails() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Service Info */}
      <div>
        <h2 className="text-lg font-semibold">Service Information</h2>
        <p className="text-sm text-gray-600 mt-1">
          Bathroom Plumbing Repair
        </p>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium">Description</h3>
        <p className="text-sm text-gray-600 mt-1">
          Complete repair of bathroom pipes, leak fixing, and fittings.
        </p>
      </div>

      {/* Provider Info */}
      <div>
        <h3 className="font-medium">Provider</h3>
        <p className="text-sm text-gray-600 mt-1">Ali Khan</p>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          Approve Service
        </button>

        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Reject Service
        </button>
      </div>
    </div>
  );
}
