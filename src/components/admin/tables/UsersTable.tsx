import { User } from '@/types/admin';

export const UsersTable = ({ users }: { users: User[] }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th>Name</th><th>Email</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      {users.map(u => (
        <tr key={u.id} className="border-b">
          <td>{u.name}</td>
          <td>{u.email}</td>
          <td>{u.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
