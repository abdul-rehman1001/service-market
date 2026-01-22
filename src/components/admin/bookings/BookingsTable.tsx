import BookingRow from "./BookingRow";

const bookings: Array<{
  id: string;
  service: string;
  seeker: string;
  provider: string;
  date: string;
  status: "Pending" | "Completed" | "Cancelled";
}> = [
  {
    id: "B-1001",
    service: "Bathroom Plumbing Repair",
    seeker: "Sara Ahmed",
    provider: "Ali Khan",
    date: "15 Jan 2026",
    status: "Pending",
  },
  {
    id: "B-1002",
    service: "AC Repair",
    seeker: "Ali Raza",
    provider: "CleanPro Services",
    date: "16 Jan 2026",
    status: "Completed",
  },
];

export default function BookingsTable() {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Booking ID</th>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">Seeker</th>
            <th className="p-3 text-left">Provider</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
