import { Service } from '@/types/admin';

export const ServicesTable = ({ services }: { services: Service[] }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th>Service</th><th>Provider</th><th>Status</th>
      </tr>
    </thead>
    <tbody>
      {services.map(s => (
        <tr key={s.id} className="border-b">
          <td>{s.title}</td>
          <td>{s.provider}</td>
          <td>{s.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
