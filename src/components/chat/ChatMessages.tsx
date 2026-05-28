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
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousCountRef = useRef(0);
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

  // Track whether the user is near the bottom; only then auto-stick.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldStickToBottomRef.current = distanceFromBottom < 80;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Smart auto-scroll:
  // - on first load, jump to bottom instantly
  // - on new messages, scroll only if user was already near bottom
  // - avoid smooth page-like sliding that feels jarring on mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const previousCount = previousCountRef.current;
    const currentCount = messages.length;
    const isInitialLoad = previousCount === 0 && currentCount > 0;
    const hasNewMessage = currentCount > previousCount;

    if (isInitialLoad) {
      container.scrollTop = container.scrollHeight;
    } else if (hasNewMessage && shouldStickToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }

    previousCountRef.current = currentCount;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#FFFFFF] px-6 py-4">
        <p className="text-sm text-[#6B7280]">{emptyStateText}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#F5F7F9] px-4 py-4 sm:px-6"
    >
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
