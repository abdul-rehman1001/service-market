interface Props {
  message: {
    sender: 'me' | 'them';
    text: string;
  };
}

export default function ChatBubble({ message }: Props) {
  const isMe = message.sender === 'me';

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
          isMe
            ? 'bg-emerald-600 text-white rounded-br-none'
            : 'bg-white border rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
