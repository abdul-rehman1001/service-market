import { ProfileUser } from './types';

interface Props {
  user: ProfileUser;
}

export default function ProfileOverview({ user }: Props) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">Profile Overview</h3>

      {user.role === 'provider' ? (
        <p className="text-gray-600">{user.bio}</p>
      ) : (
        <p className="text-gray-600">
          Total bookings: {user.totalBookings}
        </p>
      )}
    </div>
  );
}
