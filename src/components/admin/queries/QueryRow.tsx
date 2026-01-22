import Link from "next/link";

interface QueryRowProps {
  query: {
    id: string;
    user: string;
    type: string;
    status: "Pending" | "Resolved" | "Unresolved";
    date: string;
  };
}

export default function QueryRow({ query }: QueryRowProps) {
  const statusColor =
    query.status === "Resolved"
      ? "bg-emerald-100 text-emerald-700"
      : query.status === "Unresolved"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <tr className="border-t">
      <td className="p-3 font-medium">{query.id}</td>
      <td className="p-3">{query.user}</td>
      <td className="p-3">{query.type}</td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs ${statusColor}`}>
          {query.status}
        </span>
      </td>
      <td className="p-3">{query.date}</td>
      <td className="p-3 text-right">
        <Link
          href={`/admin/queries/${query.id}`}
          className="text-emerald-600 hover:underline"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
