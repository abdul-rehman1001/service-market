import { Conversation } from './types';

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ conversations, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <h2 className="px-4 py-3 font-semibold text-lg text-gray-900 border-b border-gray-100">
        Messages
      </h2>
      <div className="flex-1 space-y-0.5 p-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center w-full px-3 py-3 hover:bg-gray-50 rounded-xl transition ${
              activeId === conv.id ? 'bg-emerald-50' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {conv.otherUser.avatar ? (
                <img
                  src={conv.otherUser.avatar}
                  className="w-11 h-11 rounded-full object-cover"
                  alt={conv.otherUser.name}
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 text-left min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {conv.otherUser.name}
                </h3>
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-emerald-600 text-white rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">{conv.serviceName}</p>
              {conv.lastMessage && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
