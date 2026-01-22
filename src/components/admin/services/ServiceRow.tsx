import Link from "next/link";

interface ServiceRowProps {
  service: {
    id: string;
    title: string;
    provider: string;
    category: string;
    status: "Pending" | "Approved" | "Rejected";
  };
}

export default function ServiceRow({ service }: ServiceRowProps) {
  const statusColor =
    service.status === "Approved"
      ? "bg-emerald-100 text-emerald-700"
      : service.status === "Rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{service.title}</td>
      <td className="p-3">{service.provider}</td>
      <td className="p-3">{service.category}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
          {service.status}
        </span>
      </td>
      <td className="p-3 text-right">
        <Link
          href={`/admin/services/${service.id}`}
          className="text-emerald-600 hover:underline"
        >
          Review
        </Link>
      </td>
    </tr>
  );
}
