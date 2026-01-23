'use client';

import { motion } from 'framer-motion';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'rejected';
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  let text = '';
  let color = '';
  let bgColor = '';

  switch (status) {
    case 'pending':
      text = 'Your verification is pending';
      color = 'text-yellow-800';
      bgColor = 'bg-yellow-100';
      break;
    case 'verified':
      text = 'Your identity is verified ✅';
      color = 'text-green-800';
      bgColor = 'bg-green-100';
      break;
    case 'rejected':
      text = 'Your verification was rejected ❌';
      color = 'text-red-800';
      bgColor = 'bg-red-100';
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-xl border ${color} ${bgColor} shadow-sm font-medium text-center`}
    >
      {text}
    </motion.div>
  );
};
