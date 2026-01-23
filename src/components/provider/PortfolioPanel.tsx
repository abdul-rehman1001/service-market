'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PortfolioItem {
  file: File;
  description: string;
}

export const PortfolioPanel: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPEG or PNG images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }

    if (portfolio.length >= 3) {
      setError('Maximum 3 portfolio images allowed.');
      return;
    }

    setError('');
    setPortfolio([...portfolio, { file, description: '' }]);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...portfolio];
    updated[index].description = value;
    setPortfolio(updated);
  };

  const handleRemove = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (portfolio.length === 0) {
      setError('Please upload at least one portfolio image.');
      return;
    }
    alert('Portfolio uploaded successfully.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl shadow-lg space-y-5"
    >
      <h2 className="text-2xl font-semibold text-slate-800">Portfolio Management</h2>
      <p className="text-sm text-slate-500">
        Upload up to 3 images showcasing your work (JPEG/PNG, max 2MB each)
      </p>

      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 border border-slate-200 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
      />

      {portfolio.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolio.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-3 rounded-xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md"
            >
              <img
                src={URL.createObjectURL(item.file)}
                alt="Portfolio"
                className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border border-slate-200"
              />
              <input
                type="text"
                placeholder="Add description..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-700 focus:ring-emerald-500 focus:border-emerald-500 transition"
                value={item.description}
                onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              />
              <button
                className="text-red-500 font-medium hover:underline text-sm mt-2 sm:mt-0"
                onClick={() => handleRemove(idx)}
              >
                Remove
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <button
        onClick={handleUpload}
        className="px-5 py-1.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 hover:scale-105 transition-transform text-sm"
      >
        Save Portfolio
      </button>
    </motion.div>
  );
};
