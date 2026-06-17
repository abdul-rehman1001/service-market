'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AuthCard from '@/components/auth/AuthCard';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

export default function ProviderVerification() {
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>(
    'pending'
  );
  const [loading, setLoading] = useState(false);

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Only JPEG or PNG files are allowed';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 5 MB';
    }
    return null;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    setError('');
    setSuccess('');
    const file = e.target.files?.[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!frontImage || !backImage) {
      setError('Please upload both front and back CNIC images');
      return;
    }

    setLoading(true);
    try {
      // Placeholder for API request
      const formData = new FormData();
      formData.append('frontImage', frontImage);
      formData.append('backImage', backImage);

      const res = await authenticatedFetch('/api/provider/verify-identity', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit verification');
      } else {
        setSuccess('CNIC uploaded successfully! Verification pending.');
        setStatus('pending'); // FR-06-05
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<typeof status, string> = {
    pending: 'text-yellow-500',
    verified: 'text-green-600',
    rejected: 'text-red-500',
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
          Verify Your Identity
        </motion.h2>

        <p className="text-center mt-1 text-gray-500">
          Upload your CNIC front and back images for verification.
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

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">CNIC Front</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFileChange(e, setFrontImage)}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">CNIC Back</span>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFileChange(e, setBackImage)}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
            />
          </label>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>

          <p className={`text-center mt-4 font-medium ${statusColors[status]}`}>
            Verification Status: {status.toUpperCase()}
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
