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
      <div className="border-b border-[#E5E7EB] bg-[#FFF4D6] px-4 py-2 text-xs text-[#8A5A00]">
        No eligible bookings available for this conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] bg-[#F5F7F9] px-4 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Booking
      </span>
      <select
        className="rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-1.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
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
