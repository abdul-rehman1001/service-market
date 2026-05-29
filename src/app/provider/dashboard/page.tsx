'use client';

import { useState } from 'react';
import {
  DashboardSidebar,
  getProviderTabLabel,
  type ProviderDashboardTab,
} from '@/components/provider/DashboardSidebar';
import { ProviderDashboardHeader } from '@/components/provider/ProviderDashboardHeader';
import { ServicesPanel } from '@/components/provider/ServicesPanel';
import { AnalyticsPanel } from '@/components/provider/AnalyticsPanel';
import { WorkHistoryPanel } from '@/components/provider/WorkHistoryPanel';
import { ReviewsPanel } from '@/components/provider/ReviewsPanel';
import { AvailabilityPanel } from '@/components/provider/AvailabilityPanel';
import { BookingRequestsPanel } from '@/components/provider/BookingRequestsPanel';
import { DocumentManagementPanel } from '@/components/provider/DocumentManagementPanel';
import { ChatPanel } from '@/components/provider/ChatPanel';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<ProviderDashboardTab>('services');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#EEEEEE]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#1F6F5F]/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ProviderDashboardHeader
          onOpenMessages={() => {
            setActiveTab('messages');
            setSidebarOpen(false);
          }}
          onMenuClick={() => setSidebarOpen((o) => !o)}
          activeTabLabel={getProviderTabLabel(activeTab)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6">
          <div className="mb-3 lg:hidden">
            <span className="inline-flex rounded-full border border-[#6FCF97]/50 bg-white px-3 py-1 text-xs font-semibold text-[#1F6F5F]">
              {getProviderTabLabel(activeTab)}
            </span>
          </div>
          <div className="rounded-2xl border border-[#6FCF97]/35 bg-white/95 p-3 shadow-[0_12px_32px_-24px_rgba(31,111,95,0.8)] sm:p-4 md:p-5">
            {activeTab === 'services' && <ServicesPanel />}
            {activeTab === 'analytics' && <AnalyticsPanel />}
            {activeTab === 'work-history' && <WorkHistoryPanel />}
            {activeTab === 'reviews' && <ReviewsPanel />}
            {activeTab === 'availability' && <AvailabilityPanel />}
            {activeTab === 'bookings' && <BookingRequestsPanel />}
            {activeTab === 'documents' && <DocumentManagementPanel />}
            {activeTab === 'messages' && <ChatPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}
