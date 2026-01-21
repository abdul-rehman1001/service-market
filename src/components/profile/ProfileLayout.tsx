'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileOverview from './ProfileOverview';
import ProviderSection from './ProviderSection';
import SeekerSection from './SeekerSection';
import { ProfileUser } from './types';

interface Props {
  user: ProfileUser;
}

export default function ProfileLayout({ user }: Props) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <ProfileHeader user={user} />
        <ProfileTabs user={user} activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === 'overview' && <ProfileOverview user={user} />}

          {user.role === 'provider' && activeTab === 'services' && (
            <ProviderSection provider={user} />
          )}

          {user.role === 'seeker' && activeTab === 'activity' && (
            <SeekerSection seeker={user} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
