import { ProvidersTable } from '@/components/admin/tables/ProvidersTable';
import { Provider } from '@/types/admin';

const providers: Provider[] = [
  { id: '1', name: 'Emma Wilson', services: 5, status: 'Approved' },
  { id: '2', name: 'David Miller', services: 2, status: 'Pending' },
];

export default function ProvidersPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Providers</h1>

      <div className="bg-white rounded-lg border p-4">
        <ProvidersTable providers={providers} />
      </div>
    </div>
  );
}
