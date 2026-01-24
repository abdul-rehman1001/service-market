// src/app/(site)/categories/[category]/page.tsx
"use client";

import SubcategorySidebar from "@/components/site/subcategories/SubcategorySidebar";
import { categoriesData, Subcategory } from "./data";

interface PageProps {
  params: Promise<{ category: string }>;
}

// Helper: convert slug back to category name
function getCategoryFromSlug(slug: string): string | undefined {
  return Object.keys(categoriesData).find(
    (key) => key.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
  );
}

// Async page to handle params as Promise
export default async function Page({ params }: PageProps) {
  const { category: slug } = await params; // unwrap the Promise
  const categoryName = getCategoryFromSlug(slug) || "Unknown Category";
  const subcategories: Subcategory[] = categoriesData[categoryName] || [];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
      
      {/* Sidebar */}
      <div className="flex-shrink-0 w-full md:w-64">
        <SubcategorySidebar list={subcategories.map((sub) => sub.name)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{categoryName}</h1>

        {subcategories.length === 0 ? (
          <p className="text-gray-500 text-lg">No subcategories available.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((sub) => (
              <li
                key={sub.id}
                className="p-4 border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer text-gray-800 font-medium text-center"
              >
                {sub.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
