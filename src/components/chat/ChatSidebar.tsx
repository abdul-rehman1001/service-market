import { Conversation } from './types';

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ conversations, activeId, onSelect }: Props) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#FFFFFF]">
      <h2 className="border-b border-[#E5E7EB] px-4 py-3 text-base font-bold text-[#1F2937] sm:text-lg">
        Messages
      </h2>
      <div className="flex-1 space-y-1 p-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full items-center rounded-xl border px-3 py-3 text-left transition ${
              activeId === conv.id
                ? 'border-[#009966]/30 bg-[#D1FAE5]'
                : 'border-transparent hover:border-[#E5E7EB] hover:bg-[#F5F7F9]'
            }`}
          >
            <div className="flex-shrink-0">
              {conv.otherUser.avatar ? (
                <img
                  src={conv.otherUser.avatar}
                  className="h-11 w-11 rounded-2xl object-cover"
                  alt={conv.otherUser.name}
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D1FAE5] text-sm font-semibold text-[#007A52]">
                  {conv.otherUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between">
                <h3 className="truncate text-sm font-semibold text-[#1F2937]">
                  {conv.otherUser.name}
                </h3>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 shrink-0 rounded-full bg-[#009966] px-2 py-0.5 text-xs text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-[#6B7280]">{conv.serviceName}</p>
              {conv.lastMessage && (
                <p className="mt-0.5 truncate text-xs text-[#6B7280]">{conv.lastMessage}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
