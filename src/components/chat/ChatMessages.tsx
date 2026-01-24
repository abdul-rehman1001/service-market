import ChatBubble from './ChatBubble';
import { Message } from './types';

interface Props {
  messages: Message[];         // <--- Add this
  currentUserId: string;
}

export default function ChatMessages({ messages, currentUserId }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          currentUserId={currentUserId} // so ChatBubble knows who sent it
        />
      ))}
    </div>
  );
}
