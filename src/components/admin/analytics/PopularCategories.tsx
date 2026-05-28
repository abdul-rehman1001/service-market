"use client";

import { Trophy } from "lucide-react";

interface PopularCategoriesProps {
  categories: { id: string; name: string; bookings: number }[];
}

export default function PopularCategories({ categories }: PopularCategoriesProps) {
  const maxBookings = categories.length > 0 ? Math.max(...categories.map((c) => c.bookings)) : 0;

  return (
    <div className="admin-card rounded-2xl p-4 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg bg-[var(--admin-green-muted)] p-2 text-[var(--admin-green)]">
          <Trophy size={20} />
        </div>
        <h3 className="text-lg font-bold text-[var(--admin-green-dark)]">Most Popular Categories</h3>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-[var(--admin-green)]/50">No category data available.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, index) => {
            const pct = maxBookings > 0 ? (cat.bookings / maxBookings) * 100 : 0;
            return (
              <div
                key={cat.id}
                className="animate-admin-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-6 shrink-0 text-xs font-bold text-[var(--admin-green)]/50">
                      #{index + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-[var(--admin-green-dark)]">
                      {cat.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-[var(--admin-green)]">
                    {cat.bookings.toLocaleString()} bookings
                  </span>
                </div>
                <div className="ml-8 h-2.5 overflow-hidden rounded-full bg-[var(--admin-beige)]/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--admin-green)] to-[var(--admin-green-dark)] transition-all duration-700 ease-out"
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
