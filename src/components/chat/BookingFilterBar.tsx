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
      <div className="shrink-0 border-b border-[#FED7AA] bg-[#FEF3C7] px-3 py-1.5 text-[11px] font-medium text-[#B45309] sm:px-4 sm:py-2 sm:text-xs">
        No eligible bookings available for this conversation.
      </div>
    );
  }

  if (bookings.length === 1 && !allowAll) {
    return null;
  }

  return (
    <div className="shrink-0 border-b border-[#E5E7EB] bg-[#F9FAFB] px-2 py-1.5 md:px-4 md:py-2">
      <select
        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 sm:max-w-xs sm:text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Select booking thread"
      >
        {allowAll && (
          <option value="all">
            All bookings{bookings.length > 1 ? ` (${bookings.length})` : ''}
          </option>
        )}
        {bookings.map((booking) => (
          <option key={booking.id} value={booking.id}>
            {booking.serviceName} ({statusLabels[booking.status] ?? booking.status.toLowerCase()})
          </option>
        ))}
      </select>
    </div>
  );
}
