'use client';

import QueryRow from "./QueryRow";

/* =======================
   Types
======================= */

export type QueryStatus = "Pending" | "Resolved" | "Unresolved";

export interface Query {
  id: string;
  user: string;
  type: string;
  status: QueryStatus;
  date: string;
}

/* =======================
   Mock Data (replace with API later)
======================= */

const queries: Query[] = [
  {
    id: "Q-5001",
    user: "Sara Ahmed",
    type: "Service Issue",
    status: "Pending",
    date: "15 Jan 2026",
  },
  {
    id: "Q-5002",
    user: "Ali Raza",
    type: "Payment Issue",
    status: "Resolved",
    date: "16 Jan 2026",
  },
  {
    id: "Q-5003",
    user: "Hassan Khan",
    type: "Booking Cancellation",
    status: "Unresolved",
    date: "17 Jan 2026",
  },
];

/* =======================
   Component
======================= */

export default function QueriesTable() {
  return (
    <div className="bg-white rounded-xl shadow border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-emerald-50 border-b">
          <tr>
            <th className="p-3 text-left font-medium text-emerald-700">Query ID</th>
            <th className="p-3 text-left font-medium text-emerald-700">User</th>
            <th className="p-3 text-left font-medium text-emerald-700">Type</th>
            <th className="p-3 text-left font-medium text-emerald-700">Status</th>
            <th className="p-3 text-left font-medium text-emerald-700">Date</th>
            <th className="p-3 text-right font-medium text-emerald-700">Action</th>
          </tr>
        </thead>

        <tbody>
          {queries.map((query) => (
            <QueryRow key={query.id} query={query} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
