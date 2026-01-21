import { ProfileUser } from './types';

interface Props {
  user: ProfileUser;
}

export default function ProfileHeader({ user }: Props) {
  return (
    <div className="bg-white rounded-xl border p-6 flex gap-6">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
        {user.name.charAt(0)}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-sm text-gray-500 capitalize mt-1">
          {user.role}
          {user.location && ` · ${user.location}`}
        </p>
      </div>
    </div>
  );
}
