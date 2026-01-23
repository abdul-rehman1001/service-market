'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const VerifyIdentityPanel: React.FC = () => {
  const [frontCNIC, setFrontCNIC] = useState<File | null>(null);
  const [backCNIC, setBackCNIC] = useState<File | null>(null);
  const [status, setStatus] = useState<'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG or PNG files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setError('');
    side === 'front' ? setFrontCNIC(file) : setBackCNIC(file);
  };

  const handleUpload = () => {
    if (!frontCNIC || !backCNIC) {
      setError('Please upload both front and back images.');
      return;
    }
    setStatus('Pending');
    toast.success('Files uploaded successfully. Awaiting admin verification.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-md space-y-5"
    >
      <h2 className="text-2xl font-semibold text-slate-800">Verify Your Identity</h2>
      <p className="text-sm text-slate-500">Upload your CNIC images (front and back). Max size 5MB each.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[{ label: 'Front Image', file: frontCNIC, side: 'front' }, { label: 'Back Image', file: backCNIC, side: 'back' }].map((item) => (
          <div key={item.side} className="flex flex-col gap-2">
            <label className="block font-medium text-slate-700">{item.label}</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => handleFileChange(e, item.side as 'front' | 'back')}
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm text-gray-600 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
            {item.file && <p className="text-sm text-slate-600">{item.file.name}</p>}
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 font-medium text-sm">{error}</p>}

      <button
        onClick={handleUpload}
        className="px-4 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 active:scale-95 transition-transform text-sm"
      >
        Upload CNIC
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 rounded-lg border shadow-sm text-center text-sm font-medium"
        style={{
          borderColor: status === 'Verified' ? '#22c55e' : status === 'Rejected' ? '#ef4444' : '#facc15',
          color: status === 'Verified' ? '#16a34a' : status === 'Rejected' ? '#b91c1c' : '#ca8a04',
          backgroundColor: status === 'Verified' ? '#dcfce7' : status === 'Rejected' ? '#fee2e2' : '#fef9c3'
        }}
      >
        {status === 'Verified'
          ? 'Verified ✅'
          : status === 'Rejected'
          ? 'Rejected ❌'
          : 'Pending Review ⏳'}
      </motion.div>
    </motion.div>
  );
};
