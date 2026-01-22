'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CNICUploadProps {
  onUploadSuccess?: () => void;
}

export const CNICUpload: React.FC<CNICUploadProps> = ({ onUploadSuccess }) => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('File must be JPEG or PNG');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(file);
  };

  const handleUpload = () => {
    if (!frontFile || !backFile) {
      toast.error('Please upload both CNIC front and back images');
      return;
    }

    // TODO: call API to upload CNIC images
    toast.success('CNIC uploaded successfully');
    onUploadSuccess && onUploadSuccess();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">CNIC Front</label>
        <input type="file" accept="image/png, image/jpeg"
          onChange={(e) => handleFileChange(e, setFrontFile)}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">CNIC Back</label>
        <input type="file" accept="image/png, image/jpeg"
          onChange={(e) => handleFileChange(e, setBackFile)}
          className="mt-1 block w-full text-sm text-gray-600"
        />
      </div>

      <button
        onClick={handleUpload}
        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-all duration-300 hover:scale-[1.02]"
      >
        Upload CNIC
      </button>
    </div>
  );
};
