'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

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
    if (!description) {
      toast.error('Please enter a description');
      return;
    }
    if (uploadedCount >= 3) {
      toast.error('Maximum 3 portfolio images allowed');
      return;
    }

    // TODO: replace with actual backend API call
    const imageUrl = URL.createObjectURL(file);
    onUploadSuccess && onUploadSuccess(imageUrl, description);

    setFile(null);
    setDescription('');
    toast.success('Portfolio image uploaded!');
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="block w-full text-gray-600" />
      <input
        type="text"
        placeholder="Add a description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border px-3 py-2 rounded-lg"
      />
      <button
        onClick={handleUpload}
        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-all duration-300 hover:scale-[1.02]"
      >
        Upload Portfolio
      </button>
    </div>
  );
};
