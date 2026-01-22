'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Email not registered');
      } else {
        setSuccess(
          'Reset link has been sent to your email. It will expire in 30 minutes.'
        );
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-emerald-50 to-green-100">
      <AuthCard>
        <motion.h2
          className="text-3xl font-bold text-center text-emerald-700"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Forgot Password?
        </motion.h2>

        <p className="text-center mt-1 text-gray-500">
          Enter your email to receive reset instructions.
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

        {success && (
          <motion.p
            className="text-green-600 text-center mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            placeholder="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
