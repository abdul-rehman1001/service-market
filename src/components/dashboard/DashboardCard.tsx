import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
  isFull?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up',
  isFull = false,
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${isFull ? 'col-span-full' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            {trend && (
              <span className={`text-sm font-medium ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendDirection === 'up' ? '+' : '-'}{trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
    </div>
  );
};
