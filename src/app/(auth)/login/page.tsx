'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';

type Role = 'seeker' | 'provider';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('seeker');
  const [error, setError] = useState('');

  const [form, setForm] = useState<any>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    city: '',
    address: '',
    service_name: '',
    years_of_experience: '',
    location: '',
    cnic: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }

    router.push(role === 'seeker' ? '/home' : '/provider/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center text-emerald-700">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mt-1">
          Join as Service Seeker or Provider
        </p>

        {/* Role Switch */}
        <div className="flex bg-emerald-100 rounded-xl p-1 mt-6">
          {['seeker', 'provider'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r as Role)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                role === r
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700'
              }`}
            >
              {r === 'seeker' ? 'Service Seeker' : 'Service Provider'}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center mt-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input name="first_name" placeholder="First Name" onChange={handleChange} required />
            <Input name="last_name" placeholder="Last Name" onChange={handleChange} required />
          </div>

          <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <Input name="phone" placeholder="+92 3XX XXXXXXX" onChange={handleChange} required />

          <PasswordInput name="password" placeholder="Password" onChange={handleChange} required />
          <PasswordInput name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required />

          <Input name="city" placeholder="City" onChange={handleChange} required />
          <Input name="address" placeholder="Address" onChange={handleChange} required />

          {/* Provider Fields */}
          <AnimatePresence>
            {role === 'provider' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <Input name="service_name" placeholder="Service Name" onChange={handleChange} required />
                <Input name="years_of_experience" placeholder="Years of Experience" onChange={handleChange} required />
                <Input name="location" placeholder="Service Location" onChange={handleChange} required />
                <Input name="cnic" placeholder="CNIC (xxxxx-xxxxxxx-x)" onChange={handleChange} required />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Register
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
