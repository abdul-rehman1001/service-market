'use client';

import { useState, ReactNode, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export default function PasswordInput({
  icon,
  className,
  ...props
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
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
        type={show ? 'text' : 'password'}
        className={cn(
          'w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] sm:text-base',
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="shrink-0 rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
