'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProviderHeader from './ProviderHeader';
import ProviderTabs from './ProviderTabs';
import ProviderOverview from './ProviderOverview';
import ProviderServices from './ProviderServices';
import ProviderCertificates from './ProviderCertificates';
import ProviderReviews from './ProviderReviews';
import BookingCard from './BookingCard';
import { ProviderProfileType } from '@/types/provider';

interface Props {
  provider: ProviderProfileType;
}

export default function ProviderDetailPage({ provider }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Get only CERTIFICATE documents that are APPROVED
  const certificates = provider.documents.filter(
    doc => doc.documentType === 'CERTIFICATE' && doc.status === 'APPROVED'
  );

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/home');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Provider Header */}
        <ProviderHeader provider={provider} />

        {/* Tabs */}
        <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <main className="flex-1 space-y-8">
            {activeTab === 'overview' && <ProviderOverview provider={provider} />}
            {activeTab === 'services' && <ProviderServices provider={provider} />}
            {activeTab === 'certificates' && (
              <ProviderCertificates 
                certificates={certificates}
                providerName={`${provider.user.firstName} ${provider.user.lastName}`}
              />
            )}
            {activeTab === 'reviews' && (
              <ProviderReviews
                providerId={provider.id}
                initialReviews={provider.reviews}
                initialTotalReviews={provider.totalReviews}
                initialAverageRating={Number(provider.averageRating)}
              />
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-2/5">
            <BookingCard provider={provider} />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
