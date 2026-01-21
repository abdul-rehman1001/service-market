import { UsersTable } from '@/components/admin/tables/UsersTable';
import { User } from '@/types/admin';

const users: User[] = [
  { id: '1', name: 'Sarah Jenkins', email: 'sarah@mail.com', status: 'Active' },
  { id: '2', name: 'Michael Chen', email: 'michael@mail.com', status: 'Blocked' },
];

export default function UsersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <div className="bg-white rounded-lg border p-4">
        <UsersTable users={users} />
      </div>
    </div>
  );
}
