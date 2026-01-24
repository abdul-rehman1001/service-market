import { Conversation } from './types';

interface Props {
  conversations: Conversation[];
  currentUserId: string;
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ conversations, activeId, onSelect, currentUserId }: Props) {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <h2 className="px-4 py-3 font-semibold text-lg text-gray-900">Chats</h2>
      <div className="flex-1 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center w-full px-4 py-2 hover:bg-gray-50 rounded-lg transition ${
              activeId === conv.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {conv.user.avatar ? (
                <img src={conv.user.avatar} className="w-10 h-10 rounded-full" alt={conv.user.name} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                  {conv.user.name[0]}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">{conv.user.name}</h3>
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-emerald-600 text-white rounded-full px-2">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
