'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Phone } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.push('/login');
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Phone size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Phone Verification Disabled</h2>
          <p className="text-gray-600 text-sm">
            Phone OTP verification has been removed. If you’ve verified your email, you can sign in.
          </p>
          <p className="text-gray-500 text-sm mt-2">Redirecting to login…</p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
          >
            Go to Login
          </button>
          <button
            onClick={() => router.push('/register')}
            className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back to Register
          </button>
        </div>
      </AuthCard>
    </div>
  );
}

function VerifyOtpLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Phone size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Phone Verification Disabled</h2>
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </AuthCard>
    </div>
  );
}

export default function VerifyOtpRegistrationPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
