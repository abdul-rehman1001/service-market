'use client';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { key: 'services', label: 'My Services' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'work-history', label: 'Work History' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'availability', label: 'Availability' },
    { key: 'bookings', label: 'Booking Requests' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 px-4 py-6">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-8 text-emerald-700 tracking-tight">
        Provider Dashboard
      </h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                group relative w-full text-left px-4 py-2.5 rounded-lg
                text-sm font-medium
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-emerald-400" />
              )}

              {/* Label */}
              <span
                className={`
                  inline-block transition-transform duration-200
                  group-hover:translate-x-1
                  ${isActive ? 'translate-x-1' : ''}
                `}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
