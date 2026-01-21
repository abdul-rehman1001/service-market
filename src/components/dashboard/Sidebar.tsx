'use client';

import Link from 'next/link';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard', active: true },
    { icon: '🛠️', label: 'My Services', href: '/services' },
    { icon: '📅', label: 'Appointments', href: '/appointments' },
    { icon: '👤', label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
              ▦
            </div>
            <h1 className="text-xl font-bold text-gray-900">ServiceApp</h1>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-300 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Elena Voyager</p>
              <p className="text-sm text-gray-500 truncate">
                Pro Service Provider
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                item.active
                  ? 'bg-teal-50 text-teal-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition">
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
