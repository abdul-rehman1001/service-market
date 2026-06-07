'use client';

import { Check } from 'lucide-react';
import { getPasswordRuleStatus } from '@/lib/validation/authValidation';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const rules = getPasswordRuleStatus(password);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Password requirements
      </p>
      <ul className="mt-3 space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.key}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              rule.passed ? 'text-[#059669]' : 'text-[#6B7280]'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                rule.passed ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E5E7EB] text-[#9CA3AF]'
              )}
            >
              {rule.passed ? <Check className="h-2.5 w-2.5" /> : null}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
