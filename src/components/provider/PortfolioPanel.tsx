'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, AlertCircle, Trash2, Upload as UploadIcon } from 'lucide-react';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

interface PortfolioItem {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
  status: string;
  createdAt: string;
}

export const PortfolioPanel: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Get provider ID and fetch portfolio
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const res = await authenticatedFetch('/api/provider/dashboard');
        const data = await res.json();
        if (data.provider?.id) {
          setProviderId(data.provider.id);
          fetchPortfolio(data.provider.id);
        }
      } catch (err) {
        console.error('Failed to fetch provider info:', err);
      }
    };
    fetchProviderData();
  }, []);

  const fetchPortfolio = async (id: string) => {
    try {
      setLoading(true);
      const res = await authenticatedFetch(`/api/providers/${id}/documents`);
      const data = await res.json();
      if (res.ok) {
        // Filter to show portfolio images
        const portfolioItems = (data.documents || []).filter(
          (doc: PortfolioItem) => doc.documentType === 'OTHER'
        );
        setPortfolio(portfolioItems);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !providerId) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    if (portfolio.length >= 10) {
      setError('Maximum 10 portfolio images allowed.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing');
      }

      formData.append('upload_preset', uploadPreset);
      formData.append('folder', `service-market/providers/${providerId}/portfolio`);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryRes.ok) {
        throw new Error(cloudinaryData.error?.message || 'Failed to upload image');
      }

      const res = await authenticatedFetch(`/api/providers/${providerId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: cloudinaryData.secure_url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          documentType: 'OTHER',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload portfolio image');
      }

      setSuccess('Portfolio image uploaded successfully');
      fetchPortfolio(providerId);
      // Reset file input
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload portfolio image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    void itemId;
    setError('Delete portfolio image API is not available yet');
    setDeleting(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg space-y-5"
    >
      <h2 className="text-2xl font-semibold text-slate-800">Portfolio Management</h2>
      <p className="text-sm text-slate-500">
        Upload up to 10 images showcasing your work (JPEG/PNG/WebP, max 5MB each)
      </p>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* File Input */}
      <label className="block w-full">
        <div className="border-2 border-dashed border-slate-300 rounded-lg px-6 py-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
          <UploadIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-600 text-sm">
            {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-slate-400 text-xs mt-1">JPEG, PNG or WebP (max 5MB)</p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading || loading}
          className="hidden"
        />
      </label>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : portfolio.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-sm">No portfolio images yet. Upload your first image!</p>
        </div>
      ) : (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Your Portfolio ({portfolio.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {portfolio.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative group bg-slate-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={item.fileUrl}
                    alt={item.fileName}
                    className="w-full h-40 object-cover"
                  />
                  {/* Overlay with delete button */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={deleting === item.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-2 disabled:opacity-50"
                    >
                      {deleting === item.id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-600 truncate">{item.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};
