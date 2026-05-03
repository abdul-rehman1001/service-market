'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import { Mail, CheckCircle } from 'lucide-react';

type EmailStatus = 'pending' | 'verifying' | 'verified' | 'error';

interface UserData {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get('userId');
  const emailToken = searchParams.get('emailToken');

  const [emailStatus, setEmailStatus] = useState<EmailStatus>('pending');
  const [userEmail, setUserEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) {
      setEmailStatus('error');
      setErrorMessage('User ID missing. Please register again or check your email link.');
      return;
    }

    const init = async () => {
      try {
        // Fetch user data
        const res = await fetch(`/api/auth/user/${userId}`);
        const data: UserData = await res.json();

        if (!res.ok || !data.user) {
          setEmailStatus('error');
          setErrorMessage('Failed to load user data.');
          return;
        }

        setUserEmail(data.user.email);

        // Already verified?
        if (data.user.emailVerified) {
          setEmailStatus('verified');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Auto-verify if token exists
        if (emailToken) {
          setEmailStatus('verifying');
          await verifyEmailWithToken(emailToken);
        }
      } catch (err) {
        console.error(err);
        setEmailStatus('error');
        setErrorMessage('Network error: Could not fetch user data.');
      }
    };

    init();
  }, [userId, emailToken]);

  const verifyEmailWithToken = async (token: string) => {
    if (!userId || !token) {
      setEmailStatus('error');
      setErrorMessage('Invalid verification link.');
      return;
    }

    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (!res.ok) {
        setEmailStatus('error');
        setErrorMessage(data.error || 'Email verification failed.');
        return;
      }

      setEmailStatus('verified');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setEmailStatus('error');
      setErrorMessage('Error verifying email.');
    }
  };

  const handleResendEmail = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await fetch('/api/auth/send-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to resend email.');
        return;
      }

      setErrorMessage('✓ Verification email sent! Check your inbox.');
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error: Could not resend email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Mail size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-500 text-sm">Step 1 of 1</p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Pending state */}
          {emailStatus === 'pending' && (
            <>
              <p className="text-gray-600 text-sm">
                {userEmail
                  ? `We've sent a verification link to ${userEmail}. Click the link in your email to verify.`
                  : 'A verification link has been sent to your email. Check your inbox.'}
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                aria-disabled={isLoading}
                className="text-emerald-600 hover:underline text-sm disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : "Didn't receive the email? Resend"}
              </button>
            </>
          )}

          {/* Verifying */}
          {emailStatus === 'verifying' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {/* Verified */}
          {emailStatus === 'verified' && (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="text-green-600 mx-auto" />
              <h3 className="font-bold text-green-700 text-lg">Email Verified!</h3>
              <p className="text-gray-600 text-sm">Redirecting to login...</p>
            </div>
          )}

          {/* Error */}
          {emailStatus === 'error' && (
            <div className="space-y-4">
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                aria-disabled={isLoading}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          )}
        </div>
      </AuthCard>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] py-8">
      <AuthCard>
        <div className="text-center">
          <Mail size={48} className="mx-auto text-emerald-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-500 text-sm">Step 1 of 1</p>
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

export default function VerifyEmailRegistrationPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}