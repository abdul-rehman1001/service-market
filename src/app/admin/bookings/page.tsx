import { BookingsTable } from '@/components/admin/tables/BookingsTable';
import { Booking } from '@/types/admin';

const bookings: Booking[] = [
  {
    id: '1',
    user: 'Sarah Jenkins',
    provider: 'Emma Wilson',
    service: 'Massage',
    status: 'Completed',
  },
  {
    id: '2',
    user: 'Michael Chen',
    provider: 'David Miller',
    service: 'Therapy',
    status: 'Pending',
  },
];

export default function BookingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>

      <div className="bg-white rounded-lg border p-4">
        <BookingsTable bookings={bookings} />
      </div>
    </div>
  );
}
