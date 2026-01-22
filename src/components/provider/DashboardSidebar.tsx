'use client';

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'services', label: 'My Services' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'work-history', label: 'Work History' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'availability', label: 'Availability' },
    { key: 'bookings', label: 'Booking Requests' }
    , { key: 'booking-status', label: 'Booking Status' }
    , { key: 'reviews', label: 'Provider Reviews' },
{ key: 'verify-identity', label: 'Verify Identity' },
{ key: 'documents', label: 'Documents' },
{ key: 'portfolio', label: 'Portfolio' },

  ];

  return (
    <aside className="w-60 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6 text-emerald-700">Dashboard</h2>
      <nav className="flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`text-left px-3 py-2 rounded-lg hover:bg-emerald-100 transition ${
              activeTab === tab.key ? 'bg-emerald-600 text-white' : 'text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};
