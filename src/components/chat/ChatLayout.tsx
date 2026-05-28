'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import BookingFilterBar from './BookingFilterBar';
import { useChatClient } from '@/hooks/useChatClient';
import { MessageSquareText, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function ChatLayout() {
  const searchParams = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

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
  } = useChatClient({ initialBookingId: bookingIdParam });

  const [hydrated, setHydrated] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setMobileSidebarOpen(true);
  }, [activeConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hasConversations = conversations.length > 0;
  const showLoader = loading && !hasConversations;

  const bookingIdsKey = activeConversation?.bookings?.map((b) => b.id).join('|') ?? '';

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

  if (!hydrated) {
    return (
      <div className="mx-auto flex h-[76vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#009966]" />
          <p className="text-sm text-[#6B7280]">Preparing chat...</p>
        </div>
      </div>
    );
  }

  if (showLoader) {
    return (
      <div className="mx-auto flex h-[76vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#009966]" />
          <p className="text-sm text-[#6B7280]">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !hasConversations) {
    return (
      <div className="mx-auto flex h-[76vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]">
        <div className="text-center">
          <p className="mb-2 text-lg text-[#6B7280]">{error}</p>
          <a href="/login" className="text-sm text-[#009966] hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!hasConversations) {
    return (
      <div className="mx-auto flex h-[76vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]">
        <div className="px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F7F9]">
            <svg className="h-8 w-8 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-[#1F2937]">No conversations yet</h3>
          <p className="text-sm text-[#6B7280]">
            Chat becomes available once a booking is confirmed between you and a service provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[76vh] flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_24px_50px_-30px_rgba(31,41,55,0.6)] md:flex-row">
      {/* Sidebar */}
      <aside
        className={`w-full flex-shrink-0 border-b border-[#E5E7EB] md:w-80 md:border-b-0 md:border-r ${
          mobileSidebarOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeId={activeConversationId || ''}
          onSelect={(id) => {
            selectConversation(id);
            if (window.innerWidth < 768) {
              setMobileSidebarOpen(false);
            }
          }}
        />
      </aside>

      {/* Chat Area */}
      <div className={`flex-1 flex-col ${mobileSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 md:hidden">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2937]"
              >
                {mobileSidebarOpen ? (
                  <PanelLeftClose className="h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="h-4 w-4" />
                )}
                Conversations
              </button>
              <span className="truncate text-xs font-medium text-[#6B7280]">
                {selectedBooking?.serviceName || activeConversation.serviceName}
              </span>
            </div>
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
              <div className="border-t border-[#E5E7EB] bg-[#FFF4D6] px-4 py-2 text-xs text-[#8A5A00]">
                {availableBookings.length === 0
                  ? 'No eligible bookings available for chat.'
                  : 'Select a booking to send a message.'}
              </div>
            )}
            <ChatInput onSend={handleSend} disabled={sending || !bookingIdForSend} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#FFFFFF] text-[#6B7280]">
            <MessageSquareText className="h-10 w-10 text-[#009966]" />
            <p className="text-sm font-medium">Select a conversation to start chatting</p>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#009966]"
            >
              Open conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
