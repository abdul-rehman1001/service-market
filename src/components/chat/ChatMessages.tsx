import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { Message } from './types';

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function ChatMessages({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-4">
        <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
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
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
