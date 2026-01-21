import { Booking } from '@/types/admin';

export const BookingsTable = ({ bookings }: { bookings: Booking[] }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th>User</th><th>Provider</th><th>Service</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      {bookings.map(b => (
        <tr key={b.id} className="border-b">
          <td>{b.user}</td>
          <td>{b.provider}</td>
          <td>{b.service}</td>
          <td>{b.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
