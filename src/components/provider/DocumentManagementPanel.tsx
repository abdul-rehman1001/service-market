'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const DocumentManagementPanel: React.FC = () => {
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    if (documents.length >= 3) {
      setError('Maximum 3 documents allowed.');
      return;
    }

    setError('');
    setDocuments([...documents, file]);
  };

  const handleRemove = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (documents.length === 0) {
      setError('Please select at least one document.');
      return;
    }
    alert('Documents uploaded successfully.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md p-6 space-y-4 max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-semibold text-slate-800">Manage Certifications</h2>
      <p className="text-sm text-slate-500">Upload PDF certifications (max 3 files, 2MB each)</p>

      {/* File Input */}
      <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-emerald-500 transition-colors">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="text-slate-500 text-sm">
          Click to upload or drag & drop your PDF here
        </span>
      </label>

      {/* Uploaded Documents List */}
      <ul className="space-y-2">
        <AnimatePresence>
          {documents.map((doc, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex justify-between items-center bg-slate-100 rounded-lg p-2 px-4 shadow-sm"
            >
              <span className="text-slate-700 text-sm">{doc.name}</span>
              <button
                className="text-red-500 font-medium hover:text-red-600 transition-colors"
                onClick={() => handleRemove(idx)}
              >
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Upload Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleUpload}
        className="w-full py-2 rounded-xl bg-emerald-600 text-white font-medium shadow hover:bg-emerald-700 transition-all"
      >
        Upload Documents
      </motion.button>
    </motion.div>
  );
};
