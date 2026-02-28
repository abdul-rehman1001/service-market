"use client";

import { Trophy } from "lucide-react";

interface PopularCategoriesProps {
  categories: { id: string; name: string; bookings: number }[];
}

export default function PopularCategories({ categories }: PopularCategoriesProps) {
  const maxBookings = categories.length > 0 ? Math.max(...categories.map((c) => c.bookings)) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={20} className="text-emerald-600" />
        <h3 className="font-semibold text-lg">Most Popular Categories</h3>
      </div>

      {categories.length === 0 ? (
        <p className="text-slate-400 text-sm">No category data available.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, index) => {
            const pct = maxBookings > 0 ? (cat.bookings / maxBookings) * 100 : 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {cat.bookings.toLocaleString()} bookings
                  </span>
                </div>
                <div className="ml-7 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
