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
      className="bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-2xl font-bold">Portfolio Management</h2>
      <p className="text-gray-500">Upload up to 3 images showcasing your work (JPEG/PNG, max 2MB each)</p>

      <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} />

      {portfolio.length > 0 && (
        <div className="mt-2 space-y-2">
          {portfolio.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-100 p-2 rounded">
              <img
                src={URL.createObjectURL(item.file)}
                alt="Portfolio"
                className="w-24 h-24 object-cover rounded"
              />
              <input
                type="text"
                placeholder="Add description..."
                className="flex-1 px-2 py-1 border rounded"
                value={item.description}
                onChange={(e) => handleDescriptionChange(idx, e.target.value)}
              />
              <button className="text-red-500" onClick={() => handleRemove(idx)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:scale-105 transition-transform"
      >
        Save Portfolio
      </button>
    </motion.div>
  );
};
