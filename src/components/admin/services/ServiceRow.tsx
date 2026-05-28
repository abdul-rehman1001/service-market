import Link from "next/link";
import { Trash2, Eye, Power, PowerOff, Wrench, User, Tag } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import type { ServiceItem } from "./ServicesTable";

interface ServiceRowProps {
  service: ServiceItem;
  index?: number;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const verificationBadge: Record<string, string> = {
  APPROVED:
    "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] border border-[var(--admin-beige)]",
  REJECTED: "bg-red-50 text-red-700 border border-red-200",
  PENDING: "bg-amber-50 text-amber-800 border border-amber-200",
};

function ServiceActions({
  service,
  onDelete,
  onToggleStatus,
}: Omit<ServiceRowProps, "index">) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/services/${service.id}`}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--admin-beige)]/60 bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--admin-green)] transition-all hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)]"
      >
        <Eye size={14} />
        View
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(service.id, service.isActive)}
        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
          service.isActive
            ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)] hover:border-[var(--admin-green)]"
        }`}
        title={service.isActive ? "Deactivate service" : "Activate service"}
      >
        {service.isActive ? (
          <>
            <PowerOff size={14} />
            Deactivate
          </>
        ) : (
          <>
            <Power size={14} />
            Activate
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => onDelete(service.id)}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100"
        title="Delete service"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </div>
  );
}

function ServiceMeta({ service }: { service: ServiceItem }) {
  const providerName =
    service.provider.businessName ||
    `${service.provider.user.firstName} ${service.provider.user.lastName}`;

  const formatPrice = (price: string) => formatPKR(price, 0);

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-green-muted)] text-[var(--admin-green)]">
          <Wrench size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--admin-green-dark)] line-clamp-1">{service.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-[var(--admin-green)]/60">
            {service.description}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[var(--admin-green-dark)]/80">
          <User size={14} className="shrink-0 text-[var(--admin-green)]" />
          <span className="truncate">{providerName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-green)]/65">
          <Tag size={14} className="shrink-0" />
          {service.category.icon && <span>{service.category.icon}</span>}
          <span>{service.category.name}</span>
        </div>
        <p className="font-medium text-[var(--admin-green-dark)]">
          {formatPrice(service.minPrice)} – {formatPrice(service.maxPrice)}
        </p>
        <p className="text-xs text-[var(--admin-green)]/60">
          {service._count.bookings} booking{service._count.bookings !== 1 ? "s" : ""}
        </p>
      </div>
    </>
  );
}

export default function ServiceRow({
  service,
  index = 0,
  onDelete,
  onToggleStatus,
}: ServiceRowProps) {
  const providerName =
    service.provider.businessName ||
    `${service.provider.user.firstName} ${service.provider.user.lastName}`;

  const formatPrice = (price: string) => formatPKR(price, 0);

  return (
    <tr
      className="animate-admin-fade-in-up border-t border-[var(--admin-beige)]/30 transition-colors hover:bg-[var(--admin-green-muted)]/30"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--admin-green-muted)] text-[var(--admin-green)]">
            <Wrench size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[var(--admin-green-dark)] line-clamp-1">
              {service.name}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-[var(--admin-green)]/60">
              {service.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-medium text-[var(--admin-green-dark)]">{providerName}</p>
        <p className="text-xs text-[var(--admin-green)]/65">{service.provider.user.email}</p>
        <span
          className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${verificationBadge[service.provider.verificationStatus] || "bg-gray-100 text-gray-700"}`}
        >
          {service.provider.verificationStatus}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 text-[var(--admin-green-dark)]/80">
          {service.category.icon && <span className="text-base">{service.category.icon}</span>}
          <span>{service.category.name}</span>
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 font-medium text-[var(--admin-green-dark)]">
        {formatPrice(service.minPrice)} – {formatPrice(service.maxPrice)}
      </td>
      <td className="px-5 py-4 text-[var(--admin-green-dark)]/80">{service._count.bookings}</td>
      <td className="px-5 py-4">
        <span
          className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${
            service.isActive
              ? "border border-[var(--admin-beige)] bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "border border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end">
          <ServiceActions
            service={service}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        </div>
      </td>
    </tr>
  );
}

export function ServiceCard({
  service,
  index = 0,
  onDelete,
  onToggleStatus,
}: ServiceRowProps) {
  return (
    <article
      className="admin-card animate-admin-fade-in-up rounded-2xl p-4"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <ServiceMeta service={service} />
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold ${
            service.isActive
              ? "bg-[var(--admin-green-muted)] text-[var(--admin-green-dark)]"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <span
        className={`mt-2 inline-block rounded-lg px-2 py-0.5 text-[10px] font-semibold ${verificationBadge[service.provider.verificationStatus] || ""}`}
      >
        {service.provider.verificationStatus}
      </span>
      <div className="mt-4 border-t border-[var(--admin-beige)]/40 pt-3">
        <ServiceActions
          service={service}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </article>
  );
}
