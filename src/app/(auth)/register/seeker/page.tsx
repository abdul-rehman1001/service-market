'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import ImageUploader from '@/components/auth/ImageUploader';

export default function RegisterSeeker() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    profileImage: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (imageUrl: string) => {
    setForm({ ...form, profileImage: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        profileImage: form.profileImage,
        role: 'SEEKER', // fixed role for seekers
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/home'); // redirect after successful registration
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Service Seeker</h2>
        <p className="text-center mt-1 text-gray-500">Join to find experts</p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <ImageUploader onImageUpload={handleImageUpload} imageUrl={form.profileImage} />
          
          <Input
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
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

          <button
            type="submit"
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition"
          >
            Create Account
          </button>
        </form>
      </AuthCard>
    </div>
  );
}
