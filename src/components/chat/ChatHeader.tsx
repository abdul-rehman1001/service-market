import { ChevronLeft } from 'lucide-react';
import { ChatUser } from './types';

interface Props {
  user: ChatUser;
  serviceName?: string;
  bookingStatus?: string;
  onBack?: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'bg-[#D1FAE5] text-[#059669] border border-[#BBF7D0]' },
  EN_ROUTE: { label: 'En Route', color: 'bg-[#FEF3C7] text-[#B45309] border border-[#FED7AA]' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-[#EFF6FF] text-[#1E3A5F] border border-[#DBEAFE]' },
  COMPLETED: { label: 'Completed', color: 'bg-[#D1FAE5] text-[#059669] border border-[#BBF7D0]' },
};

export default function ChatHeader({ user, serviceName, bookingStatus, onBack }: Props) {
  const status = bookingStatus ? statusLabels[bookingStatus] : null;
  const subtitle = serviceName
    ? status
      ? `${serviceName} · ${status.label}`
      : serviceName
    : status?.label;

  return (
    <header className="flex shrink-0 items-center gap-1.5 border-b border-[#E5E7EB] bg-white px-1.5 py-2 md:gap-3 md:px-4 md:py-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#1E3A5F] transition hover:bg-[#F9FAFB] md:hidden"
          aria-label="Back to conversations"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {user.avatar ? (
        <img
          src={user.avatar}
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-[#E5E7EB] sm:h-10 sm:w-10"
          alt={user.name}
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#10B981] text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-[#1E3A5F] sm:text-base">{user.name}</h2>
        {subtitle && <p className="truncate text-xs text-[#6B7280]">{subtitle}</p>}
      </div>

      {status && (
        <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex sm:px-2.5 sm:py-1 sm:text-xs ${status.color}`}>
          {status.label}
        </span>
      )}
    </header>
  );
}
