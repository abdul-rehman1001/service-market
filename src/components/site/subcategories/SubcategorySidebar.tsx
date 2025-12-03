"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  list: string[];
}

export default function SubcategorySidebar({ list }: Props) {
  const pathname = usePathname(); 
  const active = pathname.split("/").pop(); // last segment

  return (
    <aside className="bg-white border rounded-xl p-4 shadow-sm sticky top-24">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Subcategories</h2>

      <div className="space-y-2">
        {list.length === 0 && (
          <p className="text-gray-500 text-sm">No subcategories available.</p>
        )}

        {list.map((item) => {
          const slug = item.toLowerCase().replace(/\s+/g, "-");
          const isActive = active === slug;

          return (
            <Link
              key={item}
              href={`/categories/${slug}`}
              className={`block px-3 py-2 rounded-lg text-sm transition
              ${isActive 
                ? "bg-blue-600 text-white shadow" 
                : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
