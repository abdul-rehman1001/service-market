import { ConversationBooking } from './types';

interface BookingFilterBarProps {
  bookings: ConversationBooking[];
  value: string;
  onChange: (value: string) => void;
  allowAll?: boolean;
}

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  EN_ROUTE: 'En Route',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

export default function BookingFilterBar({
  bookings,
  value,
  onChange,
  allowAll = true,
}: BookingFilterBarProps) {
  if (bookings.length === 0) {
    return (
      <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-100">
        No eligible bookings available for this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100">
      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
        Booking
      </span>
      <select
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {allowAll && (
          <option value="all">
            All bookings{bookings.length > 1 ? ` (${bookings.length})` : ''}
          </option>
        )}
        {bookings.map((booking) => (
          <option key={booking.id} value={booking.id}>
            {booking.serviceName} (
            {statusLabels[booking.status] ?? booking.status.toLowerCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
