'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
    alert('Files uploaded successfully. Awaiting admin verification.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">Verify Your Identity</h2>
      <p className="text-gray-500">Upload your CNIC images (front and back)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Front Image</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'front')} />
          {frontCNIC && <p className="text-sm mt-1">{frontCNIC.name}</p>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Back Image</label>
          <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'back')} />
          {backCNIC && <p className="text-sm mt-1">{backCNIC.name}</p>}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:scale-105 transition-transform"
      >
        Upload CNIC
      </button>

      <p className="mt-2">
        Status: <span className={`font-semibold ${status === 'Verified' ? 'text-green-600' : status === 'Rejected' ? 'text-red-600' : 'text-yellow-500'}`}>{status}</span>
      </p>
    </motion.div>
  );
};
