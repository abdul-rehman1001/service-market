'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProviderHeader from './ProviderHeader';
import ProviderTabs from './ProviderTabs';
import ProviderOverview from './ProviderOverview';
import ProviderServices from './ProviderServices';
import ProviderGallery from './ProviderGallery';
import ProviderReviews from './ProviderReviews';
import BookingCard from './BookingCard';
import { Provider } from '@/types/provider';

interface Props {
  provider: Provider;
}

export default function ProviderDetailPage({ provider }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
        {/* Provider Header */}
        <ProviderHeader provider={provider} />

        {/* Tabs */}
        <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <main className="flex-1 space-y-8">
            {activeTab === 'overview' && <ProviderOverview provider={provider} />}
            {activeTab === 'services' && <ProviderServices services={provider.services} />}
            {activeTab === 'gallery' && <ProviderGallery images={provider.images} providerName={provider.name} />}
            {activeTab === 'reviews' && (
              <ProviderReviews
                reviews={provider.reviews}
                totalReviews={provider.reviews.length}
                averageRating={provider.averageRating ?? 0}
              />
            )}
          </main>

          {/* Right Sidebar */}
          {provider.location && (
            <aside className="w-full lg:w-2/5 sticky top-8">
              <BookingCard provider={provider} />
            </aside>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
