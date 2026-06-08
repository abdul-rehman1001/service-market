import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { ConversationBooking, Message } from './types';

interface Props {
  messages: Message[];
  currentUserId: string;
  bookings: ConversationBooking[];
  bookingFilter: string;
  threadKey?: string;
  isActive?: boolean;
}

export default function ChatMessages({
  messages,
  currentUserId,
  bookings,
  bookingFilter,
  threadKey = '',
  isActive = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousCountRef = useRef(0);
  const previousThreadKeyRef = useRef(threadKey);

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

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior });
    bottomRef.current?.scrollIntoView({ block: 'end', behavior });
  };

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

  // Reset stick-to-bottom when switching threads
  useEffect(() => {
    if (previousThreadKeyRef.current !== threadKey) {
      previousThreadKeyRef.current = threadKey;
      previousCountRef.current = 0;
      shouldStickToBottomRef.current = true;
    }
  }, [threadKey]);

  // Scroll when thread becomes visible (was hidden behind list on mobile)
  useLayoutEffect(() => {
    if (!isActive || messages.length === 0) return;

    scrollToBottom('auto');
    const raf = requestAnimationFrame(() => scrollToBottom('auto'));
    const t1 = setTimeout(() => scrollToBottom('auto'), 50);
    const t2 = setTimeout(() => scrollToBottom('auto'), 150);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isActive, threadKey, messages.length]);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const previousCount = previousCountRef.current;
    const currentCount = messages.length;
    const isInitialLoad = previousCount === 0 && currentCount > 0;
    const hasNewMessage = currentCount > previousCount;

    if (isInitialLoad || (hasNewMessage && shouldStickToBottomRef.current)) {
      scrollToBottom('auto');
      requestAnimationFrame(() => scrollToBottom('auto'));
    }

    previousCountRef.current = currentCount;
  }, [messages, isActive]);

  // Re-scroll when container resizes (keyboard, orientation, layout paint)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

    const observer = new ResizeObserver(() => {
      if (shouldStickToBottomRef.current) {
        scrollToBottom('auto');
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [isActive, threadKey]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 basis-0 items-center justify-center bg-[#F5F7F8] px-4 py-4">
        <p className="text-sm text-[#6B7280]">{emptyStateText}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 basis-0 space-y-1.5 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#F5F7F8] px-1.5 py-2 [-webkit-overflow-scrolling:touch] md:space-y-2 md:px-4 md:py-3"
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
      <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
    </div>
  );
}
