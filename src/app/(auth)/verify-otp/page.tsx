'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import OtpInputGroup from '@/components/auth/otp/OtpInputGroup';
import OtpTimer from '@/components/auth/otp/OtpTimer';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Invalid OTP');
      return;
    }

    router.push(data.role === 'provider' ? '/provider/dashboard' : '/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center text-emerald-700">
          Verify OTP
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Enter the 6-digit code sent to your phone
        </p>

        {error && (
          <p className="text-red-500 text-center mt-3 text-sm">{error}</p>
        )}

        <div className="mt-6">
          <OtpInputGroup value={otp} onChange={setOtp} />
        </div>

        <OtpTimer />

        <button
          onClick={handleVerify}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all hover:scale-[1.02]"
        >
          Verify & Continue
        </button>
      </AuthCard>
    </div>
  );
}
