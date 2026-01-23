'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface PortfolioUploadProps {
  onUploadSuccess?: (imageUrl: string, description: string) => void;
  uploadedCount: number;
}

export const PortfolioUpload: React.FC<PortfolioUploadProps> = ({ onUploadSuccess, uploadedCount }) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
      toast.error('Only JPEG or PNG images are allowed');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error('File size must not exceed 2MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select an image');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (uploadedCount >= 3) {
      toast.error('Maximum 3 portfolio images allowed');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    onUploadSuccess && onUploadSuccess(imageUrl, description);

    setFile(null);
    setDescription('');
    toast.success('Portfolio image uploaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-slate-800">Upload Portfolio Image</h2>
      <p className="text-sm text-slate-500">Upload JPEG or PNG images (max 2MB) and provide a description</p>

      <div className="space-y-3">
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 border border-slate-200 rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Add a description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-300 px-3 py-2 rounded-lg text-sm text-slate-700"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleUpload}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-all duration-300"
      >
        Upload Portfolio
      </motion.button>

      {file && (
        <div className="mt-2 flex items-center gap-3 bg-gray-50 p-3 border border-slate-200 rounded-lg shadow-sm">
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-md border border-slate-200"
          />
          <div className="flex-1 text-sm text-slate-700">{description || 'No description yet'}</div>
        </div>
      )}
    </motion.div>
  );
};
