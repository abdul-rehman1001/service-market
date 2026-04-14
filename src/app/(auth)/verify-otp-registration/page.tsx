'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { auth, getRecaptcha, signInWithPhoneNumber } from '@/lib/firebase';
import { Phone, CheckCircle } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  console.log('VerifyOtpContent - URL params:', { userId });

  const [userData, setUserData] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [phoneStatus, setPhoneStatus] = useState<'pending' | 'otp-sent' | 'verified' | 'error'>('pending');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    console.log('VerifyOtpRegistration - userId from URL:', userId);
    
    if (!userId) {
      console.error('VerifyOtpRegistration - No userId found in URL parameters');
      setPhoneError('User ID required. Please ensure you accessed this page from the verification email.');
      setIsLoadingUser(false);
      return;
    }

    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data for userId:', userId);
      const res = await fetch(`/api/auth/user/${userId}`);
      const data = await res.json();

      console.log('User data response:', { status: res.status, data });

      if (!res.ok) {
        console.error('User fetch failed:', data);
        setPhoneError(`Error: ${data.error || 'Failed to load user data'}`);
        setIsLoadingUser(false);
        return;
      }

      if (!data.user || !data.user.phone) {
        console.error('User data invalid:', data.user);
        setPhoneError('Phone number not found in user data');
        setIsLoadingUser(false);
        return;
      }

      console.log('User data loaded successfully:', data.user);
      setUserData(data.user);
      setIsLoadingUser(false);
    } catch (err) {
      console.error('User data fetch network error:', err);
      setPhoneError(`Connection error: ${err instanceof Error ? err.message : 'Failed to connect'}`);
      setIsLoadingUser(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      if (!userData?.phone) {
        setPhoneError('Phone number not found');
        return;
      }

      setIsLoading(true);
      setPhoneError('');

      const recaptcha = getRecaptcha('recaptcha-container');
      if (!recaptcha) {
        setPhoneError('reCAPTCHA not ready. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      await recaptcha.render();

      const result = await signInWithPhoneNumber(auth, userData.phone, recaptcha);

      setConfirmationResult(result);
      setPhoneStatus('otp-sent');
      setPhoneError('✓ OTP sent successfully! Check your SMS.');
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setPhoneError(error.message || 'Failed to send OTP');
      setPhoneStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!confirmationResult) {
        setPhoneError('Send OTP first');
        return;
      }

      if (!otp || otp.length !== 6) {
        setPhoneError('Please enter a 6-digit OTP');
        return;
      }

      if (!userId) {
        setPhoneError('User ID missing');
        return;
      }

      setIsLoading(true);
      setPhoneError('');

      const result = await confirmationResult.confirm(otp);

      const res = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          firebaseUid: result.user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setPhoneStatus('verified');

      // Redirect to appropriate dashboard after 1.5 seconds
      setTimeout(() => {
        const normalizedRole = String(userData?.role || '').toUpperCase();

        if (normalizedRole === 'PROVIDER') {
          router.push('/provider/dashboard');
        } else if (normalizedRole === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setPhoneError(error.message || 'Invalid OTP. Please try again.');
      setPhoneStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setOtp('');
      setPhoneError('');
      setPhoneStatus('pending');
      setConfirmationResult(null);
      await handleSendOtp();
    } catch (err) {
      console.error(err);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
        <AuthCard>
          <p className="text-red-500 text-center">Error: User ID missing. Please register again.</p>
        </AuthCard>
      </div>
    );
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
        <AuthCard>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-gray-600">Loading verification details...</p>
          </div>
        </AuthCard>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
        <AuthCard>
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-semibold text-sm mb-2">Unable to Load Verification</p>
              <p className="text-red-600 text-sm">{phoneError || 'Failed to load user data'}</p>
            </div>

            <button
              onClick={() => {
                setIsLoadingUser(true);
                setPhoneError('');
                fetchUserData();
              }}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
            >
              Try Again
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Phone size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Verify Your Phone</h2>
          <p className="text-gray-500 text-sm">Step 2 of 2</p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Phone Number Display */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm mb-1">Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{userData?.phone || 'Loading...'}</p>
            <p className="text-xs text-gray-500 mt-2">We'll send an OTP to this number</p>
          </div>

          {/* OTP Status */}
          {phoneStatus === 'pending' && (
            <div className="space-y-3">
              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              {phoneError && <p className="text-red-600 text-sm text-center">{phoneError}</p>}
            </div>
          )}

          {phoneStatus === 'otp-sent' && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{phoneError}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-digit OTP</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                  }}
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                onClick={handleResendOtp}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Didn't receive OTP? Resend
              </button>

              {phoneError && <p className="text-red-600 text-sm text-center">{phoneError}</p>}
            </div>
          )}

          {phoneStatus === 'verified' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="font-bold text-green-700 text-lg">Phone Verified!</h3>
              <p className="text-gray-600 text-sm">Your account is fully verified. Redirecting to dashboard...</p>
            </div>
          )}

          {phoneStatus === 'error' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{phoneError}</p>
              </div>

              <button
                onClick={() => {
                  setPhoneStatus('pending');
                  setOtp('');
                  setPhoneError('');
                  setConfirmationResult(null);
                }}
                className="w-full px-4 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Recaptcha Container */}
        <div id="recaptcha-container" className="mt-6"></div>
      </AuthCard>
    </div>
  );
}

// Loading fallback component
function VerifyOtpLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Phone size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Verify Your Phone</h2>
          <p className="text-gray-500 text-sm">Step 2 of 2</p>
        </div>
        <div className="mt-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </AuthCard>
    </div>
  );
}

// Main component wrapped with Suspense
export default function VerifyOtpRegistrationPage() {
  return (
    <Suspense fallback={<VerifyOtpLoading />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
