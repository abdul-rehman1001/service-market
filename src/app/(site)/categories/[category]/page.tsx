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
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <SubcategorySidebar list={subcategories.map((sub) => sub.name)} />

      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">{categoryName}</h1>

        {subcategories.length === 0 ? (
          <p className="text-gray-500">No subcategories available.</p>
        ) : (
          <ul className="space-y-2">
            {subcategories.map((sub) => (
              <li key={sub.id} className="text-gray-700">
                {sub.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
