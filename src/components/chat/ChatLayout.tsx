'use client';

import { useSearchParams } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useChatClient } from '@/hooks/useChatClient';

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

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const hasConversations = conversations.length > 0;
  const showLoader = loading && !hasConversations;

  const handleSend = (content: string) => {
    void sendMessage(content);
  };

  if (showLoader) {
    return (
      <div className="max-w-7xl mx-auto h-[80vh] flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error && !hasConversations) {
    return (
      <div className="max-w-7xl mx-auto h-[80vh] flex items-center justify-center bg-white rounded-2xl shadow-lg">
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
      <div className="max-w-7xl mx-auto h-[80vh] flex items-center justify-center bg-white rounded-2xl shadow-lg">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">No conversations yet</h3>
          <p className="text-gray-500 text-sm">
            Chat becomes available once a booking is confirmed between you and a service provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden bg-white">
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
              serviceName={activeConversation.serviceName}
              bookingStatus={activeConversation.bookingStatus}
            />
            <ChatMessages
              messages={messages}
              currentUserId={currentUserId}
            />
            <ChatInput onSend={handleSend} disabled={sending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
