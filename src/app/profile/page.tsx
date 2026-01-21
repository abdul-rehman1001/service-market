'use client';

import ProfileLayout from '@/components/profile/ProfileLayout';
import { MOCK_PROVIDER } from '@/components/profile/mock';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileLayout user={MOCK_PROVIDER} />
    </div>
  );
}
