'use client';

import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export default function Input({ icon, className, ...props }: InputProps) {
  const hasError = props['aria-invalid'];

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-[#F9FAFB] px-4 py-3 transition-all duration-200',
        hasError
          ? 'border-[#EF4444] ring-2 ring-[#EF4444]/10'
          : 'border-[#E5E7EB] focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#10B981]/15 hover:border-[#D1D5DB]'
      )}
    >
      {icon ? <span className="shrink-0 text-[#6B7280]">{icon}</span> : null}
      <input
        {...props}
        className={cn(
          'w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] sm:text-base',
          className
        )}
      />
    </div>
  );
}
