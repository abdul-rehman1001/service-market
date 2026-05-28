import Link from "next/link";
import { Pencil, Trash2, Power, PowerOff, FolderTree } from "lucide-react";
import type { Category } from "./CategoryTable";

interface CategoryActionsProps {
  category: Category;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

function useCategoryMeta(category: Category) {
  const hasChildren = category.children.length > 0;
  const totalUsage =
    category._count.services +
    category._count.portfolios +
    category._count.problemQueries;
  const canDelete = !hasChildren && totalUsage === 0;
  return { hasChildren, totalUsage, canDelete };
}

function CategoryUsage({ category }: { category: Category }) {
  const { hasChildren, totalUsage } = useCategoryMeta(category);

  return (
    <div className="text-xs text-[var(--admin-green-dark)]/75">
      {category._count.services > 0 && (
        <div>
          {category._count.services} service{category._count.services !== 1 ? "s" : ""}
        </div>
      )}
      {hasChildren && (
        <div className="font-medium text-amber-700">
          {category.children.length} subcategor{category.children.length === 1 ? "y" : "ies"}
        </div>
      )}
      {totalUsage === 0 && !hasChildren && (
        <span className="text-[var(--admin-green)]/45">No usage</span>
      )}
    </div>
  );
}

function CategoryActions({ category, onDelete, onToggleStatus }: CategoryActionsProps) {
  const { canDelete } = useCategoryMeta(category);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-beige)]/60 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
      >
        <Pencil size={14} />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(category.id, category.isActive)}
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
          category.isActive
            ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] hover:border-[var(--admin-green)]"
        }`}
      >
        {category.isActive ? (
          <>
            <PowerOff size={14} />
            Disable
          </>
        ) : (
          <>
            <Power size={14} />
            Enable
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => onDelete(category.id)}
        disabled={!canDelete}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
        title={
          canDelete
            ? "Delete category"
            : "Cannot delete: category has children or is in use"
        }
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

interface CategoryRowProps extends CategoryActionsProps {
  index?: number;
}

export default function CategoryRow({
  category,
  index = 0,
  onDelete,
  onToggleStatus,
}: CategoryRowProps) {
  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-green-muted)] text-lg">
            {category.icon || <FolderTree size={18} className="text-[var(--admin-green)]" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--admin-green-dark)]">{category.name}</p>
            {category.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-[var(--admin-green)]/60">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-[var(--admin-green-dark)]/75">
        {category.parent ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--admin-green-muted)] px-2 py-1 text-xs font-medium">
            {category.parent.name}
          </span>
        ) : (
          <span className="text-[var(--admin-green)]/40">—</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${
            category.isActive
              ? "border border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <CategoryUsage category={category} />
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <CategoryActions
            category={category}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </div>
      </td>
    </tr>
  );
}

export function CategoryCard({
  category,
  index = 0,
  onDelete,
  onToggleStatus,
}: CategoryRowProps) {
  return (
    <article
      className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-green-muted)] text-xl">
          {category.icon || <FolderTree size={22} className="text-[var(--admin-green)]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-[var(--admin-green-dark)]">{category.name}</p>
            <span
              className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                category.isActive
                  ? "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {category.description && (
            <p className="mt-1 text-xs text-[var(--admin-green)]/65 line-clamp-2">
              {category.description}
            </p>
          )}
          {category.parent && (
            <p className="mt-2 text-xs text-[var(--admin-green)]/70">
              Parent: <span className="font-medium">{category.parent.name}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-[var(--admin-beige)]/40 pt-3">
        <CategoryUsage category={category} />
      </div>

      <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
        <CategoryActions
          category={category}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </article>
  );
}
