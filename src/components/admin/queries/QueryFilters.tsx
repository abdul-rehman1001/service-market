"use client";

import { useState } from "react";

export default function QueryFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium">Search</label>
        <input
          type="text"
          placeholder="Query ID, User Name, Email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-md focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded-md focus:ring-2 focus:ring-emerald-500"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Resolved</option>
          <option>Unresolved</option>
        </select>
      </div>

      <button className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
        Apply Filters
      </button>
    </div>
  );
}
