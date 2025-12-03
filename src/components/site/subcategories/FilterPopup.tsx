"use client";

import { useState } from "react";

export default function FilterPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* BODY */}
        <div className="space-y-4">

          {/* Rating Filter */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Minimum Rating</p>
            <select className="border rounded-lg px-3 py-2 w-full">
              <option>Any</option>
              <option>4.5+</option>
              <option>4.0+</option>
              <option>3.5+</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Price Range</p>
            <input type="range" className="w-full" />
          </div>

          {/* Distance */}
          <div>
            <p className="font-medium text-gray-700 mb-2">Distance</p>
            <input type="range" className="w-full" />
          </div>

        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
