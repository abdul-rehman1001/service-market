import { ChatUser } from './types';

interface Props {
  user: ChatUser;
  serviceName?: string;
  bookingStatus?: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'bg-[#D1FAE5] text-[#007A52] border border-[#A7F3D0]' },
  EN_ROUTE: { label: 'En Route', color: 'bg-[#FFF4D6] text-[#8A5A00] border border-[#FDE68A]' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]' },
  COMPLETED: { label: 'Completed', color: 'bg-[#D1FAE5] text-[#007A52] border border-[#A7F3D0]' },
};

export default function ChatHeader({ user, serviceName, bookingStatus }: Props) {
  const status = bookingStatus ? statusLabels[bookingStatus] : null;

  return (
    <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 shadow-sm">
      <div className="flex items-center">
        {user.avatar ? (
          <img src={user.avatar} className="mr-3 h-10 w-10 rounded-2xl object-cover" alt={user.name} />
        ) : (
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D1FAE5] font-semibold text-[#007A52]">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-[#1F2937]">{user.name}</h2>
          {serviceName && (
            <p className="text-xs text-[#6B7280]">{serviceName}</p>
          )}
        </div>
      </div>
      {status && (
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
          {status.label}
        </span>
      )}
    </div>
  );
}
