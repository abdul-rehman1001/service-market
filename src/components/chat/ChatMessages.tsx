import { useEffect, useMemo, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { ConversationBooking, Message } from './types';

interface Props {
  messages: Message[];
  currentUserId: string;
  bookings: ConversationBooking[];
  bookingFilter: string;
}

export default function ChatMessages({ messages, currentUserId, bookings, bookingFilter }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const bookingMap = useMemo(() => {
    return bookings.reduce<Record<string, ConversationBooking>>((acc, booking) => {
      acc[booking.id] = booking;
      return acc;
    }, {});
  }, [bookings]);
  const showBookingLabels = bookingFilter === '' && bookings.length > 1;
  const emptyStateText = bookingFilter
    ? 'No messages yet for this booking.'
    : 'No messages yet. Say hello!';

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <p className="text-gray-400 text-sm">{emptyStateText}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          booking={bookingMap[msg.bookingId]}
          showBookingLabel={showBookingLabels}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
