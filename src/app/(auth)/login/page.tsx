'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';

export default function LoginPage() {
  const router = useRouter();
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

      const activeMode = String(data?.user?.role || '').toUpperCase();

      if (activeMode === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else if (activeMode === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
      <AuthCard>
        <motion.h2
          className="text-3xl font-bold text-center text-emerald-700"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Login
        </motion.h2>
        <p className="text-center text-gray-500 mt-2">
          Enter your email and password to continue
        </p>

        {error && (
          <motion.p
            className="text-red-500 text-center mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
          autoComplete="off"
        >
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <PasswordInput
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-800">Remember me</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                Stay signed in securely for up to 30 days on this device
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push('/home')}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          Continue as guest
        </button>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don’t have an account?{' '}
          <a
            href="/register"
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign Up
          </a>
        </p>

        <p className="text-center mt-2 text-sm text-gray-500">
          <a
            href="/forgot-password"
            className="text-blue-500 hover:underline"
          >
            Forgot password?
          </a>
        </p>
      </AuthCard>
    </div>
  );
}
