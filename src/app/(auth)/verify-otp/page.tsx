"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyOtpPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/login'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Phone Verification Disabled</h2>
      <p>Phone OTP verification has been removed. Redirecting to login…</p>
    </div>
  );
}