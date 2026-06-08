import { Conversation } from './types';

interface Props {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({ conversations, activeId, onSelect }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <h2 className="shrink-0 border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-base font-bold text-[#1E3A5F] md:px-4 md:py-3 md:text-lg">
        Messages
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex w-full items-center border-b border-[#E5E7EB]/70 px-3 py-3 text-left transition active:bg-[#F3F4F6] md:mx-1 md:mb-1 md:rounded-xl md:border md:px-4 ${
              activeId === conv.id
                ? 'bg-[#D1FAE5]/50 md:border-[#10B981]/30 md:bg-[#D1FAE5]'
                : 'bg-white md:border-transparent md:hover:border-[#E5E7EB] md:hover:bg-[#F9FAFB]'
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
