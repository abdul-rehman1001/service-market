import { useState } from 'react';

interface Props {
  onSend: (content: string) => void;
}

export default function ChatInput({ onSend }: Props) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 rounded-full px-4 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm hover:bg-emerald-700 transition"
      >
        Send
      </button>
    </form>
  );
}
