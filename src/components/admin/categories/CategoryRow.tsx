import Link from "next/link";
import { Pencil, Trash2, Power, PowerOff, FolderTree } from "lucide-react";
import type { Category } from "./CategoryTable";

interface CategoryActionsProps {
  category: Category;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  compact?: boolean;
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
    <div className="space-y-0.5 text-xs text-[#6B7280]">
      {category._count.services > 0 && (
        <div>
          <span className="font-semibold text-[#111827]">{category._count.services}</span>{" "}
          service{category._count.services !== 1 ? "s" : ""}
        </div>
      )}
      {category._count.portfolios > 0 && (
        <div>
          <span className="font-semibold text-[#111827]">{category._count.portfolios}</span>{" "}
          portfolio{category._count.portfolios !== 1 ? "s" : ""}
        </div>
      )}
      {category._count.problemQueries > 0 && (
        <div>
          <span className="font-semibold text-[#111827]">{category._count.problemQueries}</span>{" "}
          quer{category._count.problemQueries !== 1 ? "ies" : "y"}
        </div>
      )}
      {hasChildren && (
        <div className="inline-flex items-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1E3A5F]">
          {category.children.length} subcategor{category.children.length === 1 ? "y" : "ies"}
        </div>
      )}
      {totalUsage === 0 && !hasChildren && (
        <span className="text-[#9CA3AF]">No usage</span>
      )}
    </div>
  );
}

function CategoryActions({
  category,
  onDelete,
  onToggleStatus,
  compact = false,
}: CategoryActionsProps) {
  const { canDelete } = useCategoryMeta(category);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
          title="Edit category"
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          onClick={() => onToggleStatus(category.id, category.isActive)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
            category.isActive
              ? "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
              : "border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] hover:shadow-md"
          }`}
          title={category.isActive ? "Disable category" : "Enable category"}
        >
          {category.isActive ? <PowerOff size={16} /> : <Power size={16} />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(category.id)}
          disabled={!canDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF]"
          title={
            canDelete
              ? "Delete category"
              : "Cannot delete: category has children or is in use"
          }
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/categories/${category.id}/edit`}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 sm:flex-none"
      >
        <Pencil size={14} />
        Edit
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(category.id, category.isActive)}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:flex-none ${
          category.isActive
            ? "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
            : "border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] hover:shadow-md"
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
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:border-[#E5E7EB] disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] sm:flex-none"
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
      className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-lg shadow-sm">
            {category.icon || <FolderTree size={18} className="text-[#059669]" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#111827]">{category.name}</p>
            {category.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">
                {category.description}
              </p>
            )}
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
              Order: {category.displayOrder}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        {category.parent ? (
          <span className="inline-flex items-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1E3A5F]">
            {category.parent.name}
          </span>
        ) : (
          <span className="text-xs text-[#9CA3AF]">Top level</span>
        )}
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
            category.isActive
              ? "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]"
              : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
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
            compact
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
      className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-xl shadow-sm">
          {category.icon || <FolderTree size={22} className="text-[#059669]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-[#111827]">{category.name}</p>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                category.isActive
                  ? "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
              }`}
            >
              {category.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {category.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">{category.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {category.parent ? (
              <span className="rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2 py-0.5 font-medium text-[#1E3A5F]">
                {category.parent.name}
              </span>
            ) : (
              <span className="text-[#9CA3AF]">Top level</span>
            )}
            <span className="text-[#9CA3AF]">· Order {category.displayOrder}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#E5E7EB] pt-3">
        <CategoryUsage category={category} />
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <CategoryActions
          category={category}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </article>
  );
}
