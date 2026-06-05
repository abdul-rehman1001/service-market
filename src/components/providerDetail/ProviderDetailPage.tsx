'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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

const tabContentVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function ProviderDetailPage({ provider }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('overview');

  const supportingDocuments = provider.documents.filter(
    (doc) =>
      doc.status === 'APPROVED' &&
      (doc.documentType === 'CERTIFICATE' || doc.documentType === 'OTHER')
  );

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/home');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProviderOverview provider={provider} />;
      case 'services':
        return <ProviderServices provider={provider} />;
      case 'certificates':
        return (
          <ProviderCertificates
            certificates={supportingDocuments}
            providerName={`${provider.user.firstName} ${provider.user.lastName}`}
          />
        );
      case 'reviews':
        return (
          <ProviderReviews
            providerId={provider.id}
            initialReviews={provider.reviews}
            initialTotalReviews={provider.totalReviews}
            initialAverageRating={Number(provider.averageRating)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#EFFAF6]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(16,185,129,0.07) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <Header />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            type="button"
            onClick={handleBack}
            className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:border-[#10B981]/40 hover:bg-emerald-50/50 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </motion.div>

        <ProviderHeader provider={provider} />

        {/* Mobile booking — shown above tabs for quicker access */}
        <div className="mt-6 lg:hidden">
          <BookingCard provider={provider} />
        </div>

        <div className="mt-6 sm:mt-8">
          <ProviderTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-8">
          <main className="min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={reduceMotion ? undefined : tabContentVariants}
                initial={reduceMotion ? false : 'initial'}
                animate={reduceMotion ? undefined : 'animate'}
                exit={reduceMotion ? undefined : 'exit'}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </main>

          <aside className="hidden w-full shrink-0 lg:block lg:w-[380px] xl:w-[400px]">
            <BookingCard provider={provider} />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
