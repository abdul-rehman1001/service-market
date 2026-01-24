import { Message } from './types';

interface Props {
  message: Message;
  currentUserId: string;
}

export default function ChatBubble({ message, currentUserId }: Props) {
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
          isMe
            ? 'bg-emerald-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
