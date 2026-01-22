'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface DocumentUploadProps {
  onUploadSuccess?: (docName: string) => void;
  uploadedCount: number;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, uploadedCount }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
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
      toast.error('Please select a file to upload');
      return;
    }

    if (uploadedCount >= 3) {
      toast.error('Maximum 3 documents allowed');
      return;
    }

    // TODO: call backend API to upload PDF
    toast.success(`${file.name} uploaded successfully`);
    onUploadSuccess && onUploadSuccess(file.name);
    setFile(null);
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full text-gray-600" />
      <button
        onClick={handleUpload}
        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-all duration-300 hover:scale-[1.02]"
      >
        Upload Document
      </button>
    </div>
  );
};
