'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(17,24,39,0.06),0_1px_3px_rgba(17,24,39,0.04)] sm:rounded-3xl sm:p-8',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
