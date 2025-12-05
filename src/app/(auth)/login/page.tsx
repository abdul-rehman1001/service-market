'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Invalid credentials');
      return;
    }

    router.push('/home'); // redirect after successful login
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Welcome Back</h2>
        <p className="text-center mt-1 text-gray-500">Login to continue</p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <PasswordInput
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Link
            href="/forgot-password"
            className="block mt-2 text-right text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </Link>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don t have an account?{' '}
          <Link href="/register" className="text-blue-600 font-medium">
            Sign Up
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
