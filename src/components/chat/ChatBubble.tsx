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
        className={`max-w-[92%] rounded-2xl border px-3 py-2 text-sm shadow-sm md:max-w-[78%] lg:max-w-md lg:px-4 lg:py-2.5 ${
          isMe
            ? 'border-[#009966] bg-[#009966] text-white rounded-br-sm'
            : 'border-[#E5E7EB] bg-[#FFFFFF] text-[#1F2937] rounded-bl-sm'
        }`}
      >
        {showBookingLabel && booking && (
          <span className={`mb-1 block text-[10px] font-semibold tracking-wide ${isMe ? 'text-[#D1FAE5]' : 'text-[#009966]'}`}>
            {booking.serviceName}
          </span>
        )}
        <p>{message.content}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isMe ? 'text-[#D1FAE5]' : 'text-[#6B7280]'}`}>
            {formatTime(message.timestamp)}
          </span>
          {isMe && (
            <span className={`text-[10px] ${message.read ? 'text-[#D1FAE5]' : 'text-white/60'}`}>
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
