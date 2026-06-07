'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  getProviderTabLabel,
  type ProviderDashboardTab,
} from '@/components/provider/DashboardSidebar';

const DASHBOARD_TABS: ProviderDashboardTab[] = [
  'services',
  'analytics',
  'work-history',
  'reviews',
  'availability',
  'bookings',
  'documents',
  'messages',
  'profile',
];

function isDashboardTab(value: string | null): value is ProviderDashboardTab {
  return Boolean(value && DASHBOARD_TABS.includes(value as ProviderDashboardTab));
}

const DashboardSidebar = dynamic(
  () =>
    import('@/components/provider/DashboardSidebar').then((mod) => ({
      default: mod.DashboardSidebar,
    })),
  {
    ssr: false,
    loading: () => (
      <aside
        className="provider-sidebar fixed inset-y-0 left-0 z-50 hidden w-[min(100%,17.5rem)] shrink-0 -translate-x-full flex-col border-r border-[#6FCF97]/40 bg-gradient-to-b from-[#1F6F5F] via-[#1a5c52] to-[#1F6F5F] text-white shadow-2xl lg:static lg:z-auto lg:flex lg:w-[17.5rem] lg:translate-x-0"
        aria-hidden
      />
    ),
  }
);
import { ProviderDashboardHeader } from '@/components/provider/ProviderDashboardHeader';
import { ServicesPanel } from '@/components/provider/ServicesPanel';
import { AnalyticsPanel } from '@/components/provider/AnalyticsPanel';
import { WorkHistoryPanel } from '@/components/provider/WorkHistoryPanel';
import { ReviewsPanel } from '@/components/provider/ReviewsPanel';
import { AvailabilityPanel } from '@/components/provider/AvailabilityPanel';
import { BookingRequestsPanel } from '@/components/provider/BookingRequestsPanel';
import { DocumentManagementPanel } from '@/components/provider/DocumentManagementPanel';
import { ChatPanel } from '@/components/provider/ChatPanel';
import { ProviderProfilePanel } from '@/components/provider/ProviderProfilePanel';

function ProviderDashboardContent() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useCurrentUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProviderDashboardTab>('services');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;

    const mode = String(user.role).toUpperCase();
    if (mode === 'SEEKER') {
      router.replace('/home');
      return;
    }
    if (mode === 'ADMIN') {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, router, user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isDashboardTab(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F5F7F8]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-[#F5F7F8]">
        <ProviderDashboardHeader
          onOpenMessages={() => {
            setActiveTab('messages');
            setSidebarOpen(false);
          }}
          onOpenProfile={() => {
            setActiveTab('profile');
            setSidebarOpen(false);
          }}
          onMenuClick={() => setSidebarOpen((o) => !o)}
          activeTabLabel={getProviderTabLabel(activeTab)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F7F8] p-4 sm:p-6 lg:p-8">
          <div className="mb-4 lg:hidden">
            <span className="inline-flex rounded-lg border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#6B7280] shadow-sm">
              {getProviderTabLabel(activeTab)}
            </span>
          </div>
          {activeTab === 'services' ? (
            <div className="mx-auto max-w-7xl">
              <ServicesPanel />
            </div>
          ) : (
            <div className="mx-auto max-w-7xl rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:p-6">
              {activeTab === 'analytics' && <AnalyticsPanel />}
              {activeTab === 'work-history' && <WorkHistoryPanel />}
              {activeTab === 'reviews' && <ReviewsPanel />}
              {activeTab === 'availability' && <AvailabilityPanel />}
              {activeTab === 'bookings' && <BookingRequestsPanel />}
              {activeTab === 'documents' && <DocumentManagementPanel />}
              {activeTab === 'messages' && <ChatPanel />}
              {activeTab === 'profile' && <ProviderProfilePanel />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7F8]" />}>
      <ProviderDashboardContent />
    </Suspense>
  );
}
