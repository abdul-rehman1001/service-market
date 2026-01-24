import { ChatUser } from './types';

interface Props {
  user: ChatUser;
  status?: string; // e.g., Online, Offline
}

export default function ChatHeader({ user, status = 'Online' }: Props) {
  return (
    <div className="flex items-center px-4 py-3 bg-white shadow-sm">
      {user.avatar ? (
        <img src={user.avatar} className="w-10 h-10 rounded-full mr-3" alt={user.name} />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-white font-semibold">
          {user.name[0]}
        </div>
      )}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
        <p className="text-xs text-gray-500">{status}</p>
      </div>
    </div>
  );
}
