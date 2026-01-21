import { Provider } from '@/types/admin';

export const ProvidersTable = ({ providers }: { providers: Provider[] }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th>Name</th><th>Services</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      {providers.map(p => (
        <tr key={p.id} className="border-b">
          <td>{p.name}</td>
          <td>{p.services}</td>
          <td>{p.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
