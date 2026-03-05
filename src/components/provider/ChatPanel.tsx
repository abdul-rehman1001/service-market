'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChatClient } from '@/hooks/useChatClient';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import BookingFilterBar from '@/components/chat/BookingFilterBar';

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

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hasConversations = conversations.length > 0;
  const showLoader = loading && !hasConversations;
  const [bookingFilter, setBookingFilter] = useState<string>('');

  const bookingIdsKey = activeConversation?.bookings?.map((booking) => booking.id).join('|') ?? '';

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
      if (prev && currentBookings.some((booking) => booking.id === prev)) {
        return prev;
      }
      return currentBookings[0].id;
    });
  }, [activeConversationId, bookingIdsKey]);

  const availableBookings = activeConversation?.bookings ?? [];
  const effectiveFilter = bookingFilter || (availableBookings[0]?.id ?? '');
  const filteredMessages = useMemo(() => {
    if (!effectiveFilter) {
      return messages;
    }
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
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !hasConversations) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">{error}</p>
          <a href="/login" className="text-emerald-600 hover:underline text-sm">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!hasConversations) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-white rounded-lg">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No conversations yet</h3>
          <p className="text-gray-500 text-sm">
            Chat becomes available once a booking is confirmed with a customer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] flex flex-col md:flex-row rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Sidebar */}
      <aside className="w-full md:w-80 flex-shrink-0 border-r border-gray-200">
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId || ''}
          onSelect={selectConversation}
        />
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <ChatHeader
              user={activeConversation.otherUser}
              serviceName={selectedBooking?.serviceName || activeConversation.serviceName}
              bookingStatus={selectedBooking?.status || activeConversation.bookingStatus}
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
            />
            {!bookingIdForSend && (
              <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">
                {availableBookings.length === 0
                  ? 'No eligible bookings available for chat.'
                  : 'Select a booking to send a message.'}
              </div>
            )}
            <ChatInput onSend={handleSend} disabled={sending || !bookingIdForSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
