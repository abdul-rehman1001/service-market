"use client";

import { Brush, Cog, House, Laptop, Leaf, Palette, School } from "lucide-react";

const categories = [
  { id: 1, label: "Home Cleaning", icon: House },
  { id: 2, label: "Tutoring", icon: School },
  { id: 3, label: "Web Design", icon: Laptop },
  { id: 4, label: "Gardening", icon: Leaf },
  { id: 5, label: "Painting", icon: Palette },
  { id: 6, label: "Plumbing", icon: Cog },
];

export default function Categories() {
  return (
    <section className="w-full py-10 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">

          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                className="flex flex-col items-center justify-center w-32 h-28 rounded-2xl border bg-gray-50 hover:bg-emerald-50 transition cursor-pointer flex-shrink-0"
              >
                <Icon className="w-7 h-7 text-emerald-600" />
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {cat.label}
                </span>
              </button>
            );
          })}

        </div>

      </div>
    </section>
  );
}
