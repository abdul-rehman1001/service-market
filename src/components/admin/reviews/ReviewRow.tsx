import Link from "next/link";

interface ReviewRowProps {
  review: {
    id: string;
    service: string;
    reviewer: string;
    provider: string;
    rating: number;
    status: "Visible" | "Hidden";
  };
}

export default function ReviewRow({ review }: ReviewRowProps) {
  const statusColor =
    review.status === "Visible"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-red-100 text-red-700";

  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{review.id}</td>
      <td className="p-3">{review.service}</td>
      <td className="p-3">{review.reviewer}</td>
      <td className="p-3">{review.provider}</td>
      <td className="p-3">{review.rating} / 5</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
          {review.status}
        </span>
      </td>
      <td className="p-3 text-right space-x-2">
        <Link
          href={`/admin/reviews/${review.id}`}
          className="text-emerald-600 hover:underline"
        >
          View
        </Link>
        <button className="text-red-600 hover:underline">Delete</button>
      </td>
    </tr>
  );
}
