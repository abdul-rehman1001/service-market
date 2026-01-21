interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  status: 'Active' | 'Paused';
  onMenu?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  status,
  onMenu,
}) => {
  const statusColor = status === 'Active' ? 'text-teal-600' : 'text-gray-400';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
          {icon}
        </div>
        <button
          onClick={onMenu}
          className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
        >
          ⋮
        </button>
      </div>
      <h4 className="font-medium text-gray-900 mb-1">{title}</h4>
      <p className={`text-sm font-medium ${statusColor}`}>{status}</p>
    </div>
  );
};
