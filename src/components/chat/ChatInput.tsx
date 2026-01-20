'use client';

import { useState } from 'react';

export default function ChatInput() {
  const [message, setMessage] = useState('');

  return (
    <form className="border-t px-4 py-3 flex items-center gap-3 bg-white">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <button
        type="submit"
        className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm hover:bg-emerald-700"
      >
        Send
      </button>
    </form>
  );
}
