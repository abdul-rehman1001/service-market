'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 rounded-xl shadow-sm space-y-3"
    >
      <h3 className="text-lg font-semibold text-slate-800">Upload Document</h3>
      <p className="text-sm text-slate-500">
        Accepted format: PDF | Max size: 2MB | Maximum 3 documents
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 border border-slate-200 rounded px-2 py-1"
      />

      {file && (
        <div className="flex justify-between items-center bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
          <span>{file.name}</span>
          <button onClick={() => setFile(null)} className="font-bold hover:text-green-900">×</button>
        </div>
      )}

      <button
        onClick={handleUpload}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-all duration-300 font-medium"
      >
        Upload
      </button>
    </motion.div>
  );
};
