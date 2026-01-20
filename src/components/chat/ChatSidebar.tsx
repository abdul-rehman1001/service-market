import { Conversation } from './types';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    user: { id: 'u1', name: 'Ahmed Plumber' },
    lastMessage: 'I will arrive at 3 PM',
    unreadCount: 2,
  },
  {
    id: '2',
    user: { id: 'u2', name: 'Ahsan Electrician' },
    lastMessage: 'Job completed',
    unreadCount: 0,
  },
];

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ activeId, onSelect }: Props) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b font-semibold text-lg">
        Messages
      </div>

      <div className="flex-1 overflow-y-auto">
        {MOCK_CONVERSATIONS.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
              activeId === conv.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{conv.user.name}</span>
              {conv.unreadCount > 0 && (
                <span className="text-xs bg-emerald-600 text-white rounded-full px-2">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
