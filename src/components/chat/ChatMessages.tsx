import ChatBubble from './ChatBubble';

const MESSAGES = [
  { id: '1', sender: 'them', text: 'Hello, how can I help you?' },
  { id: '2', sender: 'me', text: 'I need pipe repair service.' },
  { id: '3', sender: 'them', text: 'Sure, when do you need it?' },
] as const;

export default function ChatMessages() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
      {MESSAGES.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
