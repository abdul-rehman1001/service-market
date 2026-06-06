'use client';

import type { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Calendar,
  ClipboardList,
  FileText,
  History,
  MessageCircle,
  Star,
  Wrench,
  X,
} from 'lucide-react';

export type ProviderDashboardTab =
  | 'services'
  | 'analytics'
  | 'work-history'
  | 'reviews'
  | 'availability'
  | 'bookings'
  | 'documents'
  | 'messages'
  | 'profile';

interface DashboardSidebarProps {
  activeTab: ProviderDashboardTab;
  setActiveTab: Dispatch<SetStateAction<ProviderDashboardTab>>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const tabs: Array<{
  key: ProviderDashboardTab;
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'services', label: 'My Services', icon: Wrench },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'work-history', label: 'Work History', icon: History },
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'availability', label: 'Availability', icon: Calendar },
  { key: 'bookings', label: 'Booking Requests', icon: ClipboardList },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'documents', label: 'Documents', icon: FileText },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  setActiveTab,
  open,
  setOpen,
}) => {
  const handleSelect = (key: ProviderDashboardTab) => {
    setActiveTab(key);
    setOpen(false);
  };

  return (
    <aside
      className={`provider-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(100%,17.5rem)] shrink-0 flex-col border-r border-[#6FCF97]/40 bg-gradient-to-b from-[#1F6F5F] via-[#1a5c52] to-[#1F6F5F] text-white shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-[17.5rem] lg:translate-x-0 lg:shadow-[6px_0_24px_-18px_rgba(31,111,95,0.85)] ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand */}
      <div className="relative border-b border-white/10 px-4 pb-4 pt-5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white/25">
              <Image
                src="/images/Servizo.jpeg"
                alt="Servizo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="truncate text-lg font-bold tracking-tight text-white">Servizo</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 sm:px-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Menu
        </p>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleSelect(tab.key)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-md ring-1 ring-[#6FCF97]/50'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#6FCF97] shadow-[0_0_8px_#6FCF97]"
                  aria-hidden
                />
              )}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-[#2FA084] text-white' : 'bg-white/8 text-[#6FCF97] group-hover:bg-white/15'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4 text-center text-[11px] text-white/50">
        Manage services, bookings &amp; availability
      </div>
    </aside>
  );
};

export function getProviderTabLabel(tab: ProviderDashboardTab): string {
  if (tab === 'profile') return 'My Profile';
  return tabs.find((t) => t.key === tab)?.label ?? 'Dashboard';
}
