import Link from "next/link";
import { Trash2 } from "lucide-react";

interface CategoryRowProps {
  category: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    parentId: string | null;
    isActive: boolean;
    displayOrder: number;
    parent: {
      id: string;
      name: string;
    } | null;
    children: any[];
    _count: {
      services: number;
      portfolios: number;
      problemQueries: number;
    };
  };
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function CategoryRow({ category, onDelete, onToggleStatus }: CategoryRowProps) {
  const hasChildren = category.children.length > 0;
  const totalUsage = category._count.services + category._count.portfolios + category._count.problemQueries;

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <div className="flex items-center gap-2">
          {category.icon && <span className="text-xl">{category.icon}</span>}
          <div>
            <p className="font-medium text-gray-900">{category.name}</p>
            {category.description && (
              <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
            )}
          </div>
        </div>
      </td>
      <td className="p-3 text-gray-600">
        {category.parent ? category.parent.name : '-'}
      </td>
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            category.isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-3 text-gray-600">
        <div className="text-xs">
          {category._count.services > 0 && (
            <div>{category._count.services} service{category._count.services !== 1 ? 's' : ''}</div>
          )}
          {hasChildren && (
            <div className="text-amber-600">{category.children.length} subcategory(ies)</div>
          )}
          {totalUsage === 0 && <span className="text-gray-400">No usage</span>}
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="text-emerald-600 hover:underline text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => onToggleStatus(category.id, category.isActive)}
            className="text-blue-600 hover:underline text-sm"
          >
            {category.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => onDelete(category.id)}
            disabled={hasChildren || totalUsage > 0}
            className="text-red-600 hover:underline text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            title={hasChildren || totalUsage > 0 ? 'Cannot delete: category has children or is in use' : 'Delete category'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
