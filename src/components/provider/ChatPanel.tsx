'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, MessageSquare, MessageSquareText } from 'lucide-react';
import { useChatClient } from '@/hooks/useChatClient';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import BookingFilterBar from '@/components/chat/BookingFilterBar';
import { isMobileViewport } from '@/components/chat/chatUtils';

const shellMd =
  'md:w-full md:rounded-2xl md:border md:border-[#E5E7EB] md:shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:h-[600px] md:min-h-[24rem] md:flex-none';

export const ChatPanel: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    currentUserId,
    loading,
    sending,
    error,
    selectConversation,
    sendMessage,
  } = useChatClient();

  const [bookingFilter, setBookingFilter] = useState<string>('');
  const [mobileListOpen, setMobileListOpen] = useState(true);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hasConversations = conversations.length > 0;
  const showLoader = loading && !hasConversations;

  const bookingIdsKey = activeConversation?.bookings?.map((booking) => booking.id).join('|') ?? '';

  useEffect(() => {
    if (!isMobileViewport()) return;
    setMobileListOpen(!activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversation) {
      setBookingFilter('');
      return;
    }

    const currentBookings = activeConversation.bookings ?? [];
    if (currentBookings.length === 0) {
      setBookingFilter('');
      return;
    }

    setBookingFilter((prev) => {
      if (prev && currentBookings.some((booking) => booking.id === prev)) return prev;
      return currentBookings[0].id;
    });
  }, [activeConversationId, bookingIdsKey]);

  const availableBookings = activeConversation?.bookings ?? [];
  const effectiveFilter = bookingFilter || (availableBookings[0]?.id ?? '');
  const filteredMessages = useMemo(() => {
    if (!effectiveFilter) return messages;
    return messages.filter((message) => message.bookingId === effectiveFilter);
  }, [messages, effectiveFilter]);

  const bookingIdForSend = effectiveFilter || null;
  const selectedBooking = bookingIdForSend
    ? availableBookings.find((booking) => booking.id === bookingIdForSend) ?? null
    : null;

  const handleSend = (content: string) => {
    if (!bookingIdForSend) {
      alert('Select a booking to send a message');
      return;
    }
    void sendMessage(content, bookingIdForSend);
  };

  if (showLoader) {
    return (
      <div className={`flex min-h-[14rem] flex-1 items-center justify-center bg-white ${shellMd}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#10B981]" />
      </div>
    );
  }

  if (error && !hasConversations) {
    return (
      <div className={`flex min-h-[14rem] flex-1 items-center justify-center bg-white ${shellMd}`}>
        <div className="text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[#EF4444]" />
          <p className="mb-2 text-sm text-[#6B7280]">{error}</p>
          <a href="/login" className="text-sm font-semibold text-[#059669]">Go to Login</a>
        </div>
      </div>
    );
  }

  if (!hasConversations) {
    return (
      <div className={`flex min-h-[14rem] flex-1 items-center justify-center bg-white ${shellMd}`}>
        <div className="px-6 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#10B981]" />
          <h3 className="text-lg font-bold text-[#1E3A5F]">No conversations yet</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Chat becomes available once a booking is confirmed with a customer.
          </p>
        </div>
      </div>
    );
  }

  const showListOnMobile = mobileListOpen;
  const showThreadOnMobile = !mobileListOpen;

  return (
    <div className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white md:flex-row ${shellMd}`}>
      <aside
        className={`flex min-h-0 flex-col md:w-80 md:shrink-0 md:border-r md:border-[#E5E7EB] ${
          showListOnMobile ? 'flex flex-1 md:flex' : 'hidden md:flex md:flex-col'
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId || ''}
          onSelect={(id) => {
            selectConversation(id);
            if (isMobileViewport()) setMobileListOpen(false);
          }}
        />
      </aside>

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
          showThreadOnMobile ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              user={activeConversation.otherUser}
              serviceName={selectedBooking?.serviceName || activeConversation.serviceName}
              bookingStatus={selectedBooking?.status || activeConversation.bookingStatus}
              onBack={() => setMobileListOpen(true)}
            />
            <BookingFilterBar
              bookings={availableBookings}
              value={effectiveFilter}
              onChange={setBookingFilter}
              allowAll={false}
            />
            <ChatMessages
              messages={filteredMessages}
              currentUserId={currentUserId}
              bookings={availableBookings}
              bookingFilter={effectiveFilter}
              threadKey={`${activeConversationId}-${effectiveFilter}`}
              isActive={showThreadOnMobile || !isMobileViewport()}
            />
            {!bookingIdForSend && (
              <div className="shrink-0 border-t border-[#FED7AA] bg-[#FEF3C7] px-3 py-1.5 text-[11px] font-medium text-[#B45309]">
                {availableBookings.length === 0
                  ? 'No eligible bookings available for chat.'
                  : 'Select a booking to send a message.'}
              </div>
            )}
            <ChatInput onSend={handleSend} disabled={sending || !bookingIdForSend} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#F5F7F8] text-[#6B7280]">
            <MessageSquareText className="h-10 w-10 text-[#10B981]" />
            <p className="text-sm font-semibold text-[#1E3A5F]">Select a conversation</p>
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              className="rounded-full bg-[#10B981] px-4 py-2 text-sm font-semibold text-white md:hidden"
            >
              View conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
