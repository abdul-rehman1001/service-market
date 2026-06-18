'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import {
  formatPakistanPhoneInput,
  PAKISTAN_PHONE_NATIONAL_LENGTH,
} from '@/lib/validation/authValidation';

interface PakistanPhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: string;
  onChange: (value: string) => void;
}

export default function PakistanPhoneInput({
  value,
  onChange,
  className,
  onBlur,
  ...props
}: PakistanPhoneInputProps) {
  const hasError = props['aria-invalid'];

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border bg-[#F9FAFB] transition-all duration-200',
          hasError
            ? 'border-[#EF4444] ring-2 ring-[#EF4444]/10'
            : 'border-[#E5E7EB] focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#10B981]/15 hover:border-[#D1D5DB]'
        )}
      >
        <span
          className="flex shrink-0 items-center border-r border-[#E5E7EB] bg-[#F3F4F6] px-4 text-sm font-semibold text-[#374151] sm:text-base"
          aria-hidden="true"
        >
          +92
        </span>
        <input
          {...props}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={PAKISTAN_PHONE_NATIONAL_LENGTH}
          placeholder="300 1234567"
          value={value}
          onChange={(e) => onChange(formatPakistanPhoneInput(e.target.value))}
          onBlur={onBlur}
          className={cn(
            'w-full min-w-0 bg-transparent px-4 py-3 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF] sm:text-base',
            className
          )}
        />
      </div>
      <p className="text-xs text-[#6B7280]">
        Enter your 10-digit mobile number after +92, without the leading 0
      </p>
    </div>
  );
}
