import { ConversationBooking, Message } from './types';

interface Props {
  message: Message;
  currentUserId: string;
  booking?: ConversationBooking;
  showBookingLabel?: boolean;
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function ChatBubble({ message, currentUserId, booking, showBookingLabel = false }: Props) {
  const isMe = message.senderId === currentUserId;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
          isMe
            ? 'bg-emerald-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {showBookingLabel && booking && (
          <span className={`block text-[10px] font-semibold tracking-wide mb-1 ${isMe ? 'text-emerald-200' : 'text-emerald-600'}`}>
            {booking.serviceName}
          </span>
        )}
        <p>{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
            {formatTime(message.timestamp)}
          </span>
          {isMe && (
            <span className={`text-[10px] ${message.read ? 'text-emerald-200' : 'text-emerald-300/60'}`}>
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
