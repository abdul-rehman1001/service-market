import ServiceRow from "./ServiceRow";

const services = [
  {
    id: "1",
    title: "Bathroom Plumbing Repair",
    provider: "Ali Khan",
    category: "Plumbing",
    status: "Pending",
  },
  {
    id: "2",
    title: "Home Electrical Wiring",
    provider: "Ahmed Raza",
    category: "Electrician",
    status: "Approved",
  },
] as const;

export default function ServicesTable() {
  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Service</th>
            <th className="p-3 text-left">Provider</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
