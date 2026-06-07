'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: 'emerald' | 'navy';
}

export default function RoleCard({
  href,
  title,
  description,
  icon,
  accent = 'emerald',
}: RoleCardProps) {
  const accentStyles =
    accent === 'navy'
      ? {
          iconBg: 'bg-[#1E3A5F]/8 group-hover:bg-[#1E3A5F]/12',
          iconText: 'text-[#1E3A5F]',
          border: 'hover:border-[#1E3A5F]/30',
          bar: 'bg-[#1E3A5F]',
          cta: 'text-[#1E3A5F]',
        }
      : {
          iconBg: 'bg-[#D1FAE5] group-hover:bg-[#10B981]/20',
          iconText: 'text-[#059669]',
          border: 'hover:border-[#10B981]/40',
          bar: 'bg-[#10B981]',
          cta: 'text-[#059669]',
        };

  return (
    <Link href={href} className="flex-1 min-w-0">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative flex h-full cursor-pointer flex-col items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-[0_2px_12px_rgba(17,24,39,0.04)] transition-all duration-300 hover:shadow-[0_8px_28px_rgba(16,185,129,0.12)]',
          accentStyles.border
        )}
      >
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300',
            accentStyles.iconBg,
            accentStyles.iconText
          )}
        >
          {icon}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#111827]">{title}</h3>
          <p className="text-sm leading-relaxed text-[#6B7280]">{description}</p>
        </div>

        <span
          className={cn(
            'mt-auto inline-flex items-center gap-1.5 text-sm font-semibold transition-transform duration-300 group-hover:translate-x-0.5',
            accentStyles.cta
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </span>

        <span
          className={cn(
            'absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl transition-all duration-300 group-hover:w-full',
            accentStyles.bar
          )}
        />
      </motion.div>
    </Link>
  );
}
