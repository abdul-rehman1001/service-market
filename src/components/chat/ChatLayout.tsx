'use client';

import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { ChatUser, Message, Conversation } from './types';

// Dummy data
const CURRENT_USER_ID = 'me';
const USERS: ChatUser[] = [
  { id: '1', name: 'Ahmed Plumber', avatar: '' },
  { id: '2', name: 'Ahsan Electrician', avatar: '' },
];

const CONVERSATIONS: Conversation[] = [
  { id: '1', user: USERS[0], lastMessage: 'I will arrive at 3 PM', unreadCount: 2 },
  { id: '2', user: USERS[1], lastMessage: 'Job completed', unreadCount: 0 },
];

const MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1', senderId: '1', content: 'Hello! How can I help you?', timestamp: new Date().toISOString() },
    { id: '2', senderId: CURRENT_USER_ID, content: 'I need pipe repair service.', timestamp: new Date().toISOString() },
  ],
  '2': [
    { id: '1', senderId: '2', content: 'Job completed.', timestamp: new Date().toISOString() },
    { id: '2', senderId: CURRENT_USER_ID, content: 'Thanks!', timestamp: new Date().toISOString() },
  ],
};

export default function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState(CONVERSATIONS[0].id);
  const [messages, setMessages] = useState(MESSAGES);

  const activeConversation = CONVERSATIONS.find(c => c.id === activeConversationId);

  const handleSend = (content: string) => {
    const newMessage: Message = {
      id: String(Date.now()),
      senderId: CURRENT_USER_ID,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages({
      ...messages,
      [activeConversationId]: [...(messages[activeConversationId] || []), newMessage],
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[80vh] flex flex-col md:flex-row shadow-lg rounded-2xl overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-full md:w-72 flex-shrink-0">
        <ChatSidebar
          conversations={CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
        />
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatHeader user={activeConversation!.user} />
<ChatMessages
  messages={messages[activeConversationId] || []} // pass the messages array
  currentUserId={CURRENT_USER_ID}
/>

        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
