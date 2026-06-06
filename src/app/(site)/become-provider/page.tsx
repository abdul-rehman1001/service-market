'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2, MapPin } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import AddressAutofill from '@/components/auth/AddressAutofill';
import { notifyAuthUpdated } from '@/lib/authEvents';

export default function BecomeProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch('/api/profile', { cache: 'no-store' });

        if (!response.ok) {
          router.replace('/login?next=/become-provider');
          return;
        }

        const data = await response.json();
        const user = data.user;

        if (user?.hasProviderProfile) {
          router.replace('/provider/dashboard');
          return;
        }

        if (user?.address) {
          setAddress(user.address);
        }
      } catch {
        setError('Unable to load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter your business or service address.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/become-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.hasProviderProfile) {
          router.push('/provider/dashboard');
          return;
        }
        setError(data.error || 'Failed to create provider profile.');
        return;
      }

      notifyAuthUpdated();
      router.push(data.redirectTo || '/provider/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#EFFAF6] px-4 py-10 sm:px-6 lg:py-14">
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Become a Provider
              </h1>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Use your existing Servizo account to offer services. You can switch
                back to customer mode anytime.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Service address
              </label>
              <AddressAutofill
                value={address}
                onChange={setAddress}
                placeholder="Where will you provide services from?"
              />
              <p className="mt-2 text-xs text-slate-500">
                This helps customers find you and is required for provider verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Creating provider profile...' : 'Continue as provider'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
