'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">Manage Certifications</h2>
      <p className="text-gray-500">Upload PDF certifications (max 3 files, 2MB each)</p>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      {documents.length > 0 && (
        <ul className="mt-2 space-y-1">
          {documents.map((doc, idx) => (
            <li key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{doc.name}</span>
              <button className="text-red-500" onClick={() => handleRemove(idx)}>Remove</button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:scale-105 transition-transform"
      >
        Upload Documents
      </button>
    </motion.div>
  );
};
