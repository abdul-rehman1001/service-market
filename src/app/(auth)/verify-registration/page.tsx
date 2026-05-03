'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Mail } from 'lucide-react';

function VerifyRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const emailToken = searchParams.get('emailToken');

  useEffect(() => {
    const qs = new URLSearchParams();
    if (userId) qs.set('userId', userId);
    if (emailToken) qs.set('emailToken', emailToken);

    // This page used to include phone OTP. It now redirects to the email verification page.
    const url = qs.toString()
      ? `/verify-email-registration?${qs.toString()}`
      : '/verify-email-registration';
    router.replace(url);
  }, [router, userId, emailToken]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Mail size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Redirecting…</h2>
          <p className="text-gray-600 text-sm">Taking you to email verification.</p>
        </div>
      </AuthCard>
    </div>
  );
}

function VerifyRegistrationLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Mail size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Redirecting…</h2>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </AuthCard>
    </div>
  );
}

export default function VerifyRegistrationPage() {
  return (
    <Suspense fallback={<VerifyRegistrationLoading />}>
      <VerifyRegistrationContent />
    </Suspense>
  );
}
