'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, MessageSquare, MessageSquareText } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import BookingFilterBar from './BookingFilterBar';
import { useChatClient } from '@/hooks/useChatClient';
import { isMobileViewport } from './chatUtils';

const shellMobile = 'h-[100dvh] max-h-[100dvh]';
const shellMd =
  'md:h-[76dvh] md:max-h-none md:w-full md:rounded-2xl md:border md:border-[#E5E7EB] md:shadow-[0_2px_12px_rgba(17,24,39,0.05)] md:min-h-[28rem] md:flex-none';

function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex min-h-[14rem] flex-1 items-center justify-center bg-white ${shellMd}`}>
      {children}
    </div>
  );
}

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
  const [mobileListOpen, setMobileListOpen] = useState(true);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isMobileViewport()) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Mobile: show list OR thread — never both. Open list when no chat selected.
  useEffect(() => {
    if (!isMobileViewport()) return;
    setMobileListOpen(!activeConversationId);
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

  if (!hydrated) {
    return (
      <CenteredShell>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#10B981]" />
          <p className="text-sm text-[#6B7280]">Preparing chat…</p>
        </div>
      </CenteredShell>
    );
  }

  if (showLoader) {
    return (
      <CenteredShell>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#10B981]" />
          <p className="text-sm text-[#6B7280]">Loading conversations…</p>
        </div>
      </CenteredShell>
    );
  }

  if (error && !hasConversations) {
    return (
      <CenteredShell>
        <div className="text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-[#EF4444]" />
          <p className="mb-2 text-sm text-[#6B7280]">{error}</p>
          <a href="/login" className="text-sm font-semibold text-[#059669]">Go to Login</a>
        </div>
      </CenteredShell>
    );
  }

  if (!hasConversations) {
    return (
      <CenteredShell>
        <div className="px-6 text-center">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-[#10B981]" />
          <h3 className="text-lg font-bold text-[#1E3A5F]">No conversations yet</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Chat becomes available once a booking is confirmed.
          </p>
        </div>
      </CenteredShell>
    );
  }

  const showListOnMobile = mobileListOpen;
  const showThreadOnMobile = !mobileListOpen;

  return (
    <div
      className={`flex min-h-0 w-full flex-col overflow-hidden bg-white max-md:fixed max-md:inset-0 max-md:z-30 md:relative md:flex-1 md:flex-row ${shellMobile} ${shellMd}`}
    >
      {/* Conversation list — full screen on mobile when open */}
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

      {/* Chat thread — full screen on mobile when open */}
      <div
        className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
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
}
