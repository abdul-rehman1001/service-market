"use client";

export default function QueryDetails() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Query Information</h2>
        <p className="text-sm text-gray-600 mt-1">Q-5001</p>
      </div>

      <div>
        <h3 className="font-medium">User</h3>
        <p className="text-sm text-gray-600 mt-1">Sara Ahmed</p>
      </div>

      <div>
        <h3 className="font-medium">Query Type</h3>
        <p className="text-sm text-gray-600 mt-1">Service Issue</p>
      </div>

      <div>
        <h3 className="font-medium">Message</h3>
        <p className="text-sm text-gray-600 mt-1">
          The plumber did not show up on the scheduled date.
        </p>
      </div>

      <div>
        <h3 className="font-medium">Contact Info</h3>
        <p className="text-sm text-gray-600 mt-1">sara@example.com</p>
      </div>

      {/* Admin Actions */}
      <div className="flex gap-4 pt-4 border-t">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
          Mark as Resolved
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
          Send Email
        </button>
      </div>
    </div>
  );
}
