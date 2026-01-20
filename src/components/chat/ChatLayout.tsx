'use client';

import { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState('1');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex h-[80vh] bg-white rounded-xl shadow-sm border overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-72 hidden md:block border-r">
          <ChatSidebar
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
          />
        </aside>

        {/* Chat Window */}
        <section className="flex flex-col flex-1">
          <ChatHeader />
          <ChatMessages />
          <ChatInput />
        </section>
      </div>
    </div>
  );
}
