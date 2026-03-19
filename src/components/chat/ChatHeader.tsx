import { ChatUser } from './types';

interface Props {
  user: ChatUser;
  serviceName?: string;
  bookingStatus?: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  EN_ROUTE: { label: 'En Route', color: 'bg-yellow-100 text-yellow-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700' },
};

export default function ChatHeader({ user, serviceName, bookingStatus }: Props) {
  const status = bookingStatus ? statusLabels[bookingStatus] : null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center">
        {user.avatar ? (
          <img src={user.avatar} className="w-10 h-10 rounded-full mr-3 object-cover" alt={user.name} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-100 mr-3 flex items-center justify-center text-emerald-700 font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
          {serviceName && (
            <p className="text-xs text-gray-500">{serviceName}</p>
          )}
        </div>
      </div>
      {status && (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
          {status.label}
        </span>
      )}
    </div>
  );
}
