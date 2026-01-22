import Link from "next/link";

interface BookingRowProps {
  booking: {
    id: string;
    service: string;
    seeker: string;
    provider: string;
    date: string;
    status: "Pending" | "Completed" | "Cancelled";
  };
}

export default function BookingRow({ booking }: BookingRowProps) {
  const statusColor =
    booking.status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : booking.status === "Cancelled"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{booking.id}</td>
      <td className="p-3">{booking.service}</td>
      <td className="p-3">{booking.seeker}</td>
      <td className="p-3">{booking.provider}</td>
      <td className="p-3">{booking.date}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
          {booking.status}
        </span>
      </td>
      <td className="p-3 text-right">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="text-emerald-600 hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
