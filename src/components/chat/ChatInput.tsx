import { useState } from 'react';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-100">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 rounded-full px-4 py-2.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
}
