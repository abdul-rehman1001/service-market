'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, LogIn, Mail, ShieldCheck } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthPageShell from '@/components/auth/AuthPageShell';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import { resolvePostLoginPath } from '@/lib/routes';
import { cn } from '@/lib/utils';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.email || !form.password) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      const activeMode = String(data?.user?.role || 'SEEKER').toUpperCase();
      const destination = resolvePostLoginPath(
        activeMode,
        searchParams.get('next')
      );
      router.push(destination);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthCard>
        <AuthHeader
          badge="Welcome back"
          title="Sign in to Servizo"
          subtitle="Enter your email and password to access your account"
        />

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-center text-sm text-[#EF4444]"
            role="alert"
          >
            {error}
          </motion.div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          autoComplete="off"
        >
          <Input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            icon={<Mail className="h-4 w-4" />}
            required
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 transition hover:border-[#10B981]/30 hover:bg-[#D1FAE5]/20">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#10B981] focus:ring-[#10B981]"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#111827]">Remember me</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7280]">
                Stay signed in securely for up to 30 days on this device
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200',
              'hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/home')}
          className="mt-3 w-full rounded-xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#374151] transition hover:border-[#10B981]/30 hover:bg-[#F9FAFB] hover:text-[#059669]"
        >
          Continue as guest
        </button>

        <div className="mt-6 space-y-3 border-t border-[#E5E7EB] pt-5 text-center">
          <p className="text-sm text-[#6B7280]">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="font-semibold text-[#10B981] transition hover:text-[#059669] hover:underline"
            >
              Create account
            </a>
          </p>
          <p className="text-sm">
            <a
              href="/forgot-password"
              className="font-medium text-[#1E3A5F] transition hover:text-[#10B981] hover:underline"
            >
              Forgot password?
            </a>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#6B7280]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
          <span>Secure login · Your data is protected</span>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <AuthCard>
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
              <p className="text-sm text-[#6B7280]">Loading...</p>
            </div>
          </AuthCard>
        </AuthPageShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
