"use client";

import Link from "next/link";

const providers = [
  {
    id: "P-2001",
    name: "Ahmed Electric",
    email: "ahmed@provider.com",
    status: "Pending",
    submitted: "10 Feb 2025",
  },
  {
    id: "P-2002",
    name: "CleanPro Services",
    email: "cleanpro@mail.com",
    status: "Verified",
    submitted: "02 Feb 2025",
  },
];

export default function ProvidersTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-emerald-100">
          <tr>
            <th className="px-4 py-3 text-left">Provider ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Submitted On</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="px-4 py-3">{p.id}</td>
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3">{p.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    p.status === "Verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3">{p.submitted}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/providers/${p.id}`}
                  className="text-emerald-600 hover:underline"
                >
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
