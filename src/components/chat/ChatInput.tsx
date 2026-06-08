'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';

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
      className="shrink-0 border-t border-[#E5E7EB] bg-white px-1.5 py-2 md:px-4 md:py-3"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
          className="min-h-[40px] flex-1 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] focus:border-[#10B981] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 disabled:opacity-50 md:px-4"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white transition hover:bg-[#059669] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2"
          aria-label="Send message"
        >
          {disabled ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </form>
  );
}
