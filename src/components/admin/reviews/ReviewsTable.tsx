import ReviewRow from "./ReviewRow";

type ReviewStatus = "Visible" | "Hidden";

interface Review {
  id: string;
  service: string;
  reviewer: string;
  provider: string;
  rating: number;
  status: ReviewStatus;
}

const reviews: Review[] = [
  {
    id: "R-3001",
    service: "Bathroom Plumbing Repair",
    reviewer: "Sara Ahmed",
    provider: "Ali Khan",
    rating: 4,
    status: "Visible",
  },
  {
    id: "R-3002",
    service: "AC Repair",
    reviewer: "Ali Raza",
    provider: "CleanPro Services",
    rating: 2,
    status: "Hidden",
  },
];

export default function ReviewsTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Review ID</th>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">Reviewer</th>
            <th className="p-3 text-left">Provider</th>
            <th className="p-3 text-left">Rating</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <ReviewRow key={r.id} review={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
