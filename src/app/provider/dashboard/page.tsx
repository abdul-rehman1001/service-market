'use client';

import { useState } from 'react';
import { DashboardSidebar } from '@/components/provider/DashboardSidebar';
import { ServicesPanel } from '@/components/provider/ServicesPanel';
import { AppointmentsPanel } from '@/components/provider/AppointmentsPanel';
import { AnalyticsPanel } from '@/components/provider/AnalyticsPanel';
import { WorkHistoryPanel } from '@/components/provider/WorkHistoryPanel';
import { ReviewsPanel } from '@/components/provider/ReviewsPanel';
import { AvailabilityPanel } from '@/components/provider/AvailabilityPanel';
import { BookingRequestsPanel } from '@/components/provider/BookingRequestsPanel';
import { BookingStatusPanel } from '@/components/provider/BookingStatusPanel';
import { ChatPanel } from '@/components/provider/ChatPanel';
import { VerifyIdentityPanel } from '@/components/provider/VerifyIdentityPanel';
import { DocumentManagementPanel } from '@/components/provider/DocumentManagementPanel';
import { PortfolioPanel } from '@/components/provider/PortfolioPanel';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'services' | 'appointments' | 'analytics' | 'work-history' | 'reviews' | 'availability' | 'bookings'|'booking-status'|'chat'|'verify-identity'|'documents'|'portfolio'
  >('services');

  

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6">
        {activeTab === 'services' && <ServicesPanel />}
        {activeTab === 'appointments' && <AppointmentsPanel />}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'work-history' && <WorkHistoryPanel />}
        {activeTab === 'reviews' && <ReviewsPanel />}
        {activeTab === 'availability' && <AvailabilityPanel />}
        {activeTab === 'bookings' && <BookingRequestsPanel />}
        {activeTab === 'booking-status' && <BookingStatusPanel />}
        {activeTab === 'chat' && <ChatPanel />}
        {activeTab === 'verify-identity' && <VerifyIdentityPanel />}
        {activeTab === 'documents' && <DocumentManagementPanel />}
        {activeTab === 'portfolio' && <PortfolioPanel />}
      </main>
    </div>
  );
}
