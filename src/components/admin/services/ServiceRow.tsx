import Link from "next/link";
import { Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface ServiceRowProps {
  service: {
    id: string;
    name: string;
    description: string;
    minPrice: string;
    maxPrice: string;
    isActive: boolean;
    createdAt: string;
    category: {
      id: string;
      name: string;
      icon: string | null;
    };
    provider: {
      id: string;
      businessName: string | null;
      verificationStatus: string;
      averageRating: string;
      totalReviews: number;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        profileImage: string | null;
      };
    };
    _count: {
      bookings: number;
    };
  };
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export default function ServiceRow({ service, onDelete, onToggleStatus }: ServiceRowProps) {
  const providerName = service.provider.businessName
    || `${service.provider.user.firstName} ${service.provider.user.lastName}`;

  const formatPrice = (price: string) => {
    return formatPKR(price, 0);
  };

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <div>
          <p className="font-medium text-gray-900 line-clamp-1">{service.name}</p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{service.description}</p>
        </div>
      </td>
      <td className="p-3">
        <div>
          <p className="text-gray-900 text-sm">{providerName}</p>
          <p className="text-xs text-gray-500">{service.provider.user.email}</p>
          <span
            className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
              service.provider.verificationStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-700'
                : service.provider.verificationStatus === 'REJECTED'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {service.provider.verificationStatus}
          </span>
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1.5">
          {service.category.icon && <span className="text-base">{service.category.icon}</span>}
          <span className="text-gray-700">{service.category.name}</span>
        </div>
      </td>
      <td className="p-3 text-gray-700">
        <span className="whitespace-nowrap">
          {formatPrice(service.minPrice)} – {formatPrice(service.maxPrice)}
        </span>
      </td>
      <td className="p-3 text-gray-700">
        {service._count.bookings}
      </td>
      <td className="p-3">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            service.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {service.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/services/${service.id}`}
            className="text-emerald-600 hover:underline text-sm flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>
          <button
            onClick={() => onToggleStatus(service.id, service.isActive)}
            className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            title={service.isActive ? 'Deactivate service' : 'Activate service'}
          >
            {service.isActive ? (
              <ToggleRight className="w-3.5 h-3.5" />
            ) : (
              <ToggleLeft className="w-3.5 h-3.5" />
            )}
            {service.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="text-red-600 hover:underline text-sm flex items-center gap-1"
            title="Delete service"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
