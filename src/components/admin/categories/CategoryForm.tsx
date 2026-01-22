"use client";

import { useState } from "react";

interface CategoryFormProps {
  initialData?: {
    name: string;
    parent: string;
    isActive: boolean;
  };
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [parent, setParent] = useState(initialData?.parent || "");
  const [isActive, setIsActive] = useState(
    initialData?.isActive ?? true
  );

  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Category Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
          placeholder="e.g. Plumbing"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Parent Category
        </label>
        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">None</option>
          <option value="Home Services">Home Services</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => setIsActive(!isActive)}
        />
        <span className="text-sm">Active</span>
      </div>

      <button
        type="submit"
        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
      >
        Save Category
      </button>
    </form>
  );
}
