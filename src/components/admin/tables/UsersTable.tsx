"use client";

import Link from "next/link";

const users = [
  {
    id: "U-1001",
    name: "Ali Khan",
    email: "ali@mail.com",
    role: "Provider",
    status: "Active",
    verification: "Pending",
  },
  {
    id: "U-1002",
    name: "Sara Ahmed",
    email: "sara@mail.com",
    role: "Seeker",
    status: "Active",
    verification: "Verified",
  },
];

export default function UsersTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-emerald-100">
          <tr>
            <th className="px-4 py-3 text-left">User ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Verification</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-4 py-3">{u.id}</td>
              <td className="px-4 py-3 font-medium">{u.name}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{u.role}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    u.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3">{u.verification}</td>
              <td className="px-4 py-3 space-x-2">
                <Link href={`/admin/users/${u.id}`} className="text-emerald-600 hover:underline">
                  View
                </Link>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}