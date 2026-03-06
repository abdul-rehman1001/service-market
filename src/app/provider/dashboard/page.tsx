'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/provider/DashboardSidebar';
import { ServicesPanel } from '@/components/provider/ServicesPanel';
import { AnalyticsPanel } from '@/components/provider/AnalyticsPanel';
import { WorkHistoryPanel } from '@/components/provider/WorkHistoryPanel';
import { ReviewsPanel } from '@/components/provider/ReviewsPanel';
import { AvailabilityPanel } from '@/components/provider/AvailabilityPanel';
import { BookingRequestsPanel } from '@/components/provider/BookingRequestsPanel';
import { ChatPanel } from '@/components/provider/ChatPanel';
import { DocumentManagementPanel } from '@/components/provider/DocumentManagementPanel';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'services' | 'analytics' | 'work-history' | 'reviews' | 'availability' | 'bookings' | 'chat' | 'documents'
  >('services');

  

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6">
        {activeTab === 'services' && <ServicesPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'work-history' && <WorkHistoryPanel />}
        {activeTab === 'reviews' && <ReviewsPanel />}
        {activeTab === 'availability' && <AvailabilityPanel />}
        {activeTab === 'bookings' && <BookingRequestsPanel />}
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'documents' && <DocumentManagementPanel />}
      </main>
    </div>
  );
}
