'use client';

import { motion } from 'framer-motion';

interface PortfolioItemProps {
  image: string;
  description: string;
}

export const PortfolioItem: React.FC<PortfolioItemProps> = ({ image, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white transition-shadow hover:shadow-md"
    >
      <img
        src={image}
        alt="Portfolio"
        className="w-full h-44 sm:h-48 object-cover"
      />
      <div className="p-3 text-sm text-slate-700 font-medium">
        {description}
      </div>
    </motion.div>
  );
};
