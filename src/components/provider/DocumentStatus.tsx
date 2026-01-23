'use client';

import { motion } from 'framer-motion';

interface DocumentStatusProps {
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const DocumentStatus: React.FC<DocumentStatusProps> = ({ name, status }) => {
  let colorClass = '';
  let text = '';

  switch (status) {
    case 'pending':
      colorClass = 'text-yellow-600 bg-yellow-50';
      text = 'Pending review';
      break;
    case 'approved':
      colorClass = 'text-green-600 bg-green-50';
      text = 'Approved ✅';
      break;
    case 'rejected':
      colorClass = 'text-red-600 bg-red-50';
      text = 'Rejected ❌';
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-white transition"
    >
      <span className="text-slate-800 font-medium">{name}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass} shadow-inner`}
      >
        {text}
      </span>
    </motion.div>
  );
};
