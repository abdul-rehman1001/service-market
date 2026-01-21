import { ServicesTable } from '@/components/admin/tables/ServicesTable';
import { Service } from '@/types/admin';

const services: Service[] = [
  { id: '1', title: 'Deep Tissue Massage', provider: 'Emma Wilson', status: 'Active' },
  { id: '2', title: 'Aromatherapy Session', provider: 'David Miller', status: 'Inactive' },
];

export default function ServicesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Services</h1>

      <div className="bg-white rounded-lg border p-4">
        <ServicesTable services={services} />
      </div>
    </div>
  );
}
