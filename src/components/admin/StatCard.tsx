export const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white border rounded-lg p-4">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className="text-2xl font-bold">{value}</h3>
  </div>
);
