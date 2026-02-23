'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { auth, getRecaptcha, signInWithPhoneNumber } from '@/lib/firebase';
import { Mail, Phone, CheckCircle } from 'lucide-react';

function VerifyRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const emailToken = searchParams.get('emailToken');
  
  console.log('VerifyRegistration - URL params:', { userId, emailToken });

  // User data
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Email verification state
  const [emailStatus, setEmailStatus] = useState<'pending' | 'verified' | 'error'>('pending');
  const [emailError, setEmailError] = useState('');

  // Phone verification state
  const [otp, setOtp] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'pending' | 'otp-sent' | 'verified' | 'error'>('pending');
  const [phoneError, setPhoneError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    if (!userId) {
      setEmailError('User ID missing');
      setEmailStatus('error');
      setIsLoadingUser(false);
      return;
    }

    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/auth/user/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        console.error('User fetch error:', data);
        setEmailError(`Failed to load user data: ${data.error}`);
        setIsLoadingUser(false);
        return;
      }

      setUserData(data.user);

      // Initialize phone verification status
      if (data.user.phoneVerified) {
        setPhoneStatus('verified');
      }

      // If user already verified email in DB, set status accordingly
      if (data.user.emailVerified) {
        setEmailStatus('verified');
      } else if (emailToken) {
        // If email token provided, verify it
        verifyEmailWithToken();
      }

      setIsLoadingUser(false);
    } catch (err) {
      console.error('User data fetch error:', err);
      setEmailError(`Error loading user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoadingUser(false);
    }
  };

  const verifyEmailWithToken = async () => {
    try {
      setEmailStatus('pending');
      setEmailError('');

      const res = await fetch(`/api/auth/verify-email?token=${emailToken}`);
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || 'Email verification failed');
        setEmailStatus('error');
        return;
      }

      setEmailStatus('verified');
      // Refresh user data
      if (userId) {
        fetchUserData();
      }
    } catch (err) {
      setEmailError('An error occurred during email verification');
      setEmailStatus('error');
      console.error(err);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      setEmailError('');

      if (!userId) {
        setEmailError('User ID missing');
        return;
      }

      const res = await fetch('/api/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || 'Failed to resend email');
        return;
      }

      setEmailError('Verification email sent! Check your inbox.');
    } catch (err) {
      setEmailError('An error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
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
        setPhoneError('Recaptcha not ready');
        return;
      }

      await recaptcha.render();

      const result = await signInWithPhoneNumber(auth, userData.phone, recaptcha);

      setConfirmationResult(result);
      setPhoneStatus('otp-sent');
      setPhoneError('OTP sent to ' + userData.phone);
    } catch (error: any) {
      console.error(error);
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

      if (!otp) {
        setPhoneError('Enter OTP');
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
      // Refresh user data
      fetchUserData();
    } catch (error: any) {
      console.error(error);
      setPhoneError(error.message || 'Invalid OTP');
      setPhoneStatus('error');
    } finally {
      setIsLoading(false);
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
          <p className="text-center text-gray-600">Loading...</p>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Verify Your Account</h2>
        <p className="text-center mt-1 text-gray-500 text-sm">
          Welcome, {userData?.firstName}! Complete verification steps below
        </p>

        <div className="mt-8 space-y-4">
          {/* Email Verification Card */}
          <div className="p-4 border-2 rounded-lg hover:border-emerald-300 transition" style={emailStatus === 'verified' ? { backgroundColor: '#f0fdf4', borderColor: '#86efac' } : {}}>
            <div className="flex items-center gap-3 mb-3">
              <Mail size={24} className={emailStatus === 'verified' ? 'text-green-600' : 'text-gray-400'} />
              <div className="flex-1">
                <h3 className="font-semibold">Email Verification</h3>
                <p className="text-xs text-gray-500">{userData?.email}</p>
              </div>
              {emailStatus === 'verified' && (
                <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                  <CheckCircle size={18} /> Verified
                </span>
              )}
            </div>

            {emailStatus === 'pending' && (
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">
                  A verification link has been sent to your email. Check your inbox (and spam folder) to verify.
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {emailError && <p className="text-amber-600 text-xs">{emailError}</p>}
              </div>
            )}

            {emailStatus === 'verified' && (
              <p className="text-green-600 text-sm font-medium">✓ Email verified successfully!</p>
            )}

            {emailStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-600 text-sm">{emailError}</p>
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            )}
          </div>

          {/* Phone Verification Card */}
          <div className="p-4 border-2 rounded-lg hover:border-emerald-300 transition" style={phoneStatus === 'verified' ? { backgroundColor: '#f0fdf4', borderColor: '#86efac' } : {}}>
            <div className="flex items-center gap-3 mb-3">
              <Phone size={24} className={phoneStatus === 'verified' ? 'text-green-600' : 'text-gray-400'} />
              <div className="flex-1">
                <h3 className="font-semibold">Phone Verification</h3>
                <p className="text-xs text-gray-500">{userData?.phone || 'Not provided'}</p>
              </div>
              {phoneStatus === 'verified' && (
                <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                  <CheckCircle size={18} /> Verified
                </span>
              )}
            </div>

            {phoneStatus === 'pending' && (
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Click below to receive an OTP on your phone.</p>
                <button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
                {phoneError && <p className="text-red-600 text-xs">{phoneError}</p>}
              </div>
            )}

            {phoneStatus === 'otp-sent' && (
              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Enter the 6-digit code sent to your phone.</p>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || !otp || otp.length !== 6}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  onClick={() => {
                    setPhoneStatus('pending');
                    setOtp('');
                    setPhoneError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Didn't receive code? Send again
                </button>
                {phoneError && <p className="text-red-600 text-xs">{phoneError}</p>}
              </div>
            )}

            {phoneStatus === 'verified' && (
              <p className="text-green-600 text-sm font-medium">✓ Phone verified successfully!</p>
            )}

            {phoneStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-600 text-sm">{phoneError}</p>
                <button
                  onClick={() => {
                    setPhoneStatus('pending');
                    setOtp('');
                    setPhoneError('');
                  }}
                  className="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Success State */}
          {emailStatus === 'verified' && phoneStatus === 'verified' && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center space-y-2">
              <h3 className="font-bold text-green-700">✓ Account Fully Verified!</h3>
              <p className="text-green-600 text-sm">Redirecting to your dashboard...</p>
            </div>
          )}

          {/* Partial Success */}
          {(emailStatus === 'verified' || phoneStatus === 'verified') && 
           !(emailStatus === 'verified' && phoneStatus === 'verified') && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-blue-700 text-sm font-medium">
                {emailStatus === 'verified' ? '✓ Email verified. Complete phone verification to finish.' : '✓ Phone verified. Complete email verification to finish.'}
              </p>
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
function VerifyRegistrationLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Mail size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Verify Your Account</h2>
          <p className="text-gray-500 text-sm">Email & Phone Verification</p>
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
export default function VerifyRegistrationPage() {
  return (
    <Suspense fallback={<VerifyRegistrationLoading />}>
      <VerifyRegistrationContent />
    </Suspense>
  );
}
