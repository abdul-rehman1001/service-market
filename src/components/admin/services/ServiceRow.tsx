import Link from "next/link";
import { Trash2, Eye, Power, PowerOff, Wrench, User, Tag } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import type { ServiceItem } from "./ServicesTable";

interface ServiceRowProps {
  service: ServiceItem;
  index?: number;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  compact?: boolean;
}

const verificationBadge: Record<string, string> = {
  APPROVED: "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]",
  REJECTED: "border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
  PENDING: "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309]",
};

function ServiceThumbnail({ service }: { service: ServiceItem }) {
  if (service.images?.[0]) {
    return (
      <img
        src={service.images[0]}
        alt={service.name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover ring-2 ring-[#E5E7EB]"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-[#059669] shadow-sm">
      <Wrench size={18} />
    </div>
  );
}

function ServiceActions({
  service,
  onDelete,
  onToggleStatus,
  compact = false,
}: Omit<ServiceRowProps, "index">) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/admin/services/${service.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 hover:shadow-md"
          title="View service"
        >
          <Eye size={16} />
        </Link>
        <button
          type="button"
          onClick={() => onToggleStatus(service.id, service.isActive)}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
            service.isActive
              ? "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
              : "border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] hover:shadow-md"
          }`}
          title={service.isActive ? "Deactivate service" : "Activate service"}
        >
          {service.isActive ? <PowerOff size={16} /> : <Power size={16} />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(service.id)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] transition-all hover:bg-[#FEE2E2]"
          title="Delete service"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/services/${service.id}`}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#059669] shadow-sm transition-all hover:border-[#10B981]/40 hover:bg-[#D1FAE5]/40 sm:flex-none"
      >
        <Eye size={14} />
        View
      </Link>
      <button
        type="button"
        onClick={() => onToggleStatus(service.id, service.isActive)}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all sm:flex-none ${
          service.isActive
            ? "border-[#FED7AA] bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A]"
            : "border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] hover:shadow-md"
        }`}
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
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#EF4444] transition-all hover:bg-[#FEE2E2] sm:flex-none"
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
        <ServiceThumbnail service={service} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-semibold text-[#111827]">{service.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">{service.description}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-[#374151]">
          <User size={14} className="shrink-0 text-[#059669]" />
          <span className="truncate">{providerName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Tag size={14} className="shrink-0 text-[#9CA3AF]" />
          {service.category.icon && <span>{service.category.icon}</span>}
          <span>{service.category.name}</span>
        </div>
        <p className="font-semibold text-[#111827]">
          {formatPrice(service.minPrice)} – {formatPrice(service.maxPrice)}
        </p>
        <p className="text-xs text-[#6B7280]">
          <span className="font-semibold text-[#111827]">{service._count.bookings}</span> booking
          {service._count.bookings !== 1 ? "s" : ""}
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
      className="animate-admin-fade-in-up border-t border-[#E5E7EB] transition-colors hover:bg-[#F9FAFB]"
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
    >
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <ServiceThumbnail service={service} />
          <div className="min-w-0">
            <p className="line-clamp-1 font-semibold text-[#111827]">{service.name}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#6B7280]">{service.description}</p>
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
              {service.defaultDurationMinutes} min
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-[#111827]">{providerName}</p>
        <p className="text-xs text-[#6B7280]">{service.provider.user.email}</p>
        <span
          className={`mt-1.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
            verificationBadge[service.provider.verificationStatus] ||
            "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {service.provider.verificationStatus}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#1E3A5F]">
          {service.category.icon && <span>{service.category.icon}</span>}
          {service.category.name}
        </span>
      </td>
      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#111827]">
        {formatPrice(service.minPrice)} – {formatPrice(service.maxPrice)}
      </td>
      <td className="px-5 py-4">
        <span className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2 text-xs font-bold text-[#111827]">
          {service._count.bookings}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
            service.isActive
              ? "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]"
              : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
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
            compact
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
      className="animate-admin-fade-in-up rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/30 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)]"
      style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <ServiceMeta service={service} />
        </div>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${
            service.isActive
              ? "border-[#BBF7D0] bg-[#D1FAE5] text-[#059669]"
              : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
          }`}
        >
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <span
        className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
          verificationBadge[service.provider.verificationStatus] ||
          "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
        }`}
      >
        {service.provider.verificationStatus}
      </span>
      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <ServiceActions
          service={service}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </article>
  );
}
