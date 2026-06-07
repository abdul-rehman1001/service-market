'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export default function AuthHeader({
  title,
  subtitle,
  badge,
  className,
}: AuthHeaderProps) {
  return (
    <div className={cn('text-center', className)}>
      {badge ? (
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 inline-flex items-center rounded-full border border-[#D1FAE5] bg-[#D1FAE5]/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#059669]"
        >
          {badge}
        </motion.span>
      ) : null}

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl font-bold tracking-tight text-[#1E3A5F] sm:text-3xl"
      >
        {title}
      </motion.h1>

      {subtitle ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-2 text-sm leading-relaxed text-[#6B7280] sm:text-base"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
