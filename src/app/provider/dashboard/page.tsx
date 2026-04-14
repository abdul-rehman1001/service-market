'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/provider/DashboardSidebar';
import { ProviderDashboardHeader } from '@/components/provider/ProviderDashboardHeader';
import { ServicesPanel } from '@/components/provider/ServicesPanel';
import { AnalyticsPanel } from '@/components/provider/AnalyticsPanel';
import { WorkHistoryPanel } from '@/components/provider/WorkHistoryPanel';
import { ReviewsPanel } from '@/components/provider/ReviewsPanel';
import { AvailabilityPanel } from '@/components/provider/AvailabilityPanel';
import { BookingRequestsPanel } from '@/components/provider/BookingRequestsPanel';
import { DocumentManagementPanel } from '@/components/provider/DocumentManagementPanel';
import { ChatPanel } from '@/components/provider/ChatPanel';

type ProviderDashboardTab =
  | 'services'
  | 'analytics'
  | 'work-history'
  | 'reviews'
  | 'availability'
  | 'bookings'
  | 'documents'
  | 'messages';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<ProviderDashboardTab>('services');

  

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <ProviderDashboardHeader onOpenMessages={() => setActiveTab('messages')} />
      
      {/* Main Dashboard */}
      <div className="flex flex-1">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'services' && <ServicesPanel />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'work-history' && <WorkHistoryPanel />}
          {activeTab === 'reviews' && <ReviewsPanel />}
          {activeTab === 'availability' && <AvailabilityPanel />}
          {activeTab === 'bookings' && <BookingRequestsPanel />}
          {activeTab === 'documents' && <DocumentManagementPanel />}
          {activeTab === 'messages' && <ChatPanel />}
        </main>
      </div>
    </div>
  );
}
