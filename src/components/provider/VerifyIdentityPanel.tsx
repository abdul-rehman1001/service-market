'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Loader } from 'lucide-react';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

export const VerifyIdentityPanel: React.FC = () => {
  const [frontCNIC, setFrontCNIC] = useState<File | null>(null);
  const [backCNIC, setBackCNIC] = useState<File | null>(null);
  const [status, setStatus] = useState<'Pending' | 'Verified' | 'Rejected'>('Pending');
  const [error, setError] = useState('');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [cnicNumber, setCnicNumber] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await authenticatedFetch('/api/provider/dashboard');
        const data = await res.json();
        if (res.ok && data.provider?.id) {
          setProviderId(data.provider.id);
          const verificationStatus = (data.provider.verificationStatus || 'PENDING') as string;
          setStatus(
            verificationStatus === 'APPROVED'
              ? 'Verified'
              : verificationStatus === 'REJECTED'
              ? 'Rejected'
              : 'Pending'
          );
          setCnicNumber(data.provider.cnic || '');
        }
      } catch (err) {
        console.error('Failed to fetch provider dashboard:', err);
      }
    };
    fetchProvider();
  }, []);

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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `service-market/providers/${providerId}/cnic`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return data.secure_url;
  };

  const saveDocument = async (
    file: File,
    documentType: 'CNIC_FRONT' | 'CNIC_BACK'
  ) => {
    const fileUrl = await uploadToCloudinary(file);

    const res = await authenticatedFetch(`/api/providers/${providerId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        documentType,
        cnicNumber: cnicNumber || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to save document');
    }
  };

  const handleUpload = async () => {
    if (!providerId) {
      setError('Provider profile not found. Please refresh and try again.');
      return;
    }

    if (!frontCNIC || !backCNIC) {
      setError('Please upload both front and back images.');
      return;
    }

    if (!/^\d{13}$/.test(cnicNumber)) {
      setError('CNIC must be exactly 13 digits.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      await saveDocument(frontCNIC, 'CNIC_FRONT');
      await saveDocument(backCNIC, 'CNIC_BACK');
      setStatus('Pending');
      toast.success('CNIC uploaded successfully. Awaiting admin verification.');
      setFrontCNIC(null);
      setBackCNIC(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
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

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">CNIC Number (13 digits)</label>
        <input
          type="text"
          inputMode="numeric"
          value={cnicNumber}
          onChange={(e) => setCnicNumber(e.target.value.replace(/\D/g, '').slice(0, 13))}
          placeholder="1234567890123"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:ring-emerald-500 focus:border-emerald-500 transition"
        />
      </div>

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
        disabled={uploading}
        className="px-4 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 active:scale-95 transition-transform text-sm"
      >
        {uploading ? (
          <span className="inline-flex items-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Uploading...
          </span>
        ) : (
          'Upload CNIC'
        )}
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
