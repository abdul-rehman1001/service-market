interface TaskItemProps {
  id: string;
  title: string;
  subtitle: string;
  priority?: 'High Priority' | 'Routine' | 'Optional';
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  subtitle,
  priority,
  isCompleted,
  onToggle,
}) => {
  const priorityStyles = {
    'High Priority': 'bg-yellow-100 text-yellow-800',
    'Routine': 'bg-blue-100 text-blue-800',
    'Optional': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => onToggle(id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
          isCompleted
            ? 'bg-teal-500 border-teal-500'
            : 'border-gray-300 hover:border-teal-500'
        }`}
      >
        {isCompleted && <span className="text-white text-sm">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {title}
        </p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      {priority && (
        <span className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap ${priorityStyles[priority]}`}>
          {priority}
        </span>
      )}
    </div>
  );
};