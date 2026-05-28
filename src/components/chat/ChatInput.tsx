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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-[#E5E7EB] bg-[#FFFFFF] px-3 py-3 sm:gap-3 sm:px-4"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 rounded-full border border-[#E5E7EB] bg-[#F5F7F9] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="rounded-full bg-[#009966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A52] disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
      >
        {disabled ? (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
}
