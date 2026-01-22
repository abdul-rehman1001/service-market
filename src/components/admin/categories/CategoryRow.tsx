import Link from "next/link";

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    parent: string;
    status: "Active" | "Inactive";
  };
}

export default function CategoryRow({ category }: CategoryRowProps) {
  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{category.name}</td>
      <td className="p-3 text-gray-600">{category.parent}</td>
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded text-xs ${
            category.status === "Active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {category.status}
        </span>
      </td>
      <td className="p-3 text-right space-x-3">
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="text-emerald-600 hover:underline"
        >
          Edit
        </Link>
        <button className="text-red-600 hover:underline">
          {category.status === "Active" ? "Disable" : "Enable"}
        </button>
      </td>
    </tr>
  );
}
