'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Briefcase,
  Check,
  Loader2,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { switchAccountMode } from '@/lib/authEvents';

type ProfileTheme = 'light' | 'dashboard';

interface ProfileModeSwitcherProps {
  activeMode: string;
  canSwitchMode?: boolean;
  onSwitched?: () => void;
  theme?: ProfileTheme;
}

const modes = [
  {
    key: 'SEEKER' as const,
    label: 'Customer',
    shortLabel: 'customer',
    description: 'Book services, manage bookings, and message providers.',
    icon: Search,
    highlights: ['Browse & book', 'My bookings', 'Messages'],
  },
  {
    key: 'PROVIDER' as const,
    label: 'Provider',
    shortLabel: 'provider',
    description: 'Manage services, availability, and incoming requests.',
    icon: Briefcase,
    highlights: ['My services', 'Availability', 'Dashboard'],
  },
];

export default function ProfileModeSwitcher({
  activeMode,
  canSwitchMode = false,
  onSwitched,
  theme: _theme = 'light',
}: ProfileModeSwitcherProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [loadingMode, setLoadingMode] = useState<'SEEKER' | 'PROVIDER' | null>(null);

  if (!canSwitchMode) {
    return null;
  }

  const normalizedMode = String(activeMode).toUpperCase();
  const activeLabel = normalizedMode === 'PROVIDER' ? 'Provider' : 'Customer';

  const handleSwitch = async (targetMode: 'SEEKER' | 'PROVIDER') => {
    if (loadingMode || normalizedMode === targetMode) return;

    setLoadingMode(targetMode);
    try {
      const data = await switchAccountMode(targetMode);
      onSwitched?.();
      router.push(
        data.redirectTo || (targetMode === 'PROVIDER' ? '/provider/dashboard' : '/home')
      );
    } catch (error) {
      console.error('Mode switch failed:', error);
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_8px_24px_-16px_rgba(17,24,39,0.12)]">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1FAE5] text-[#059669]">
                <LayoutGrid className="h-4 w-4" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                Workspace
              </p>
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-[#111827] sm:text-[1.35rem]">
              Account mode
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B7280]">
              One account, two experiences. Choose how you want to use Servizo on this device.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 self-start rounded-full border border-[#D1FAE5] bg-[#D1FAE5] px-3 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            <span className="text-xs font-semibold text-[#059669]">
              {activeLabel} mode active
            </span>
          </div>
        </div>
      </div>

      {/* Mode cards */}
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6">
        {modes.map((mode, index) => {
          const isActive = normalizedMode === mode.key;
          const isLoading = loadingMode === mode.key;
          const isDisabled = Boolean(loadingMode) && !isLoading;
          const Icon = mode.icon;

          return (
            <motion.button
              key={mode.key}
              type="button"
              onClick={() => handleSwitch(mode.key)}
              disabled={Boolean(loadingMode)}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: isDisabled ? 0.65 : 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              whileHover={
                reduceMotion || isActive || loadingMode
                  ? undefined
                  : { y: -2, transition: { duration: 0.2 } }
              }
              className={[
                'group relative flex h-full flex-col rounded-2xl border p-5 text-left transition-shadow duration-200 sm:p-6',
                isActive
                  ? 'border-[#10B981] bg-[#FFFFFF] shadow-[0_10px_28px_-18px_rgba(16,185,129,0.45)]'
                  : 'border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#10B981] hover:shadow-[0_12px_32px_-20px_rgba(17,24,39,0.14)]',
                loadingMode && !isLoading ? 'cursor-not-allowed' : '',
              ].join(' ')}
            >
              {isActive && (
                <span
                  className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-[#10B981]"
                  aria-hidden
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <div
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200',
                    isActive
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#F9FAFB] text-[#1E3A5F] ring-1 ring-[#E5E7EB] group-hover:bg-[#D1FAE5] group-hover:text-[#059669] group-hover:ring-[#D1FAE5]',
                  ].join(' ')}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#059669]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Active
                  </span>
                )}
              </div>

              <div className="mt-5">
                <h4 className="text-lg font-bold text-[#111827]">{mode.label}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {mode.description}
                </p>
              </div>

              <ul className="mt-4 flex flex-wrap gap-2">
                {mode.highlights.map((item) => (
                  <li
                    key={item}
                    className={[
                      'rounded-lg px-2.5 py-1 text-[11px] font-medium',
                      isActive
                        ? 'bg-[#D1FAE5] text-[#059669]'
                        : 'bg-[#F9FAFB] text-[#6B7280] ring-1 ring-[#E5E7EB]',
                    ].join(' ')}
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-[#E5E7EB] pt-4">
                {isActive ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-[#059669]">
                    <Check className="h-4 w-4" />
                    You are using {mode.label.toLowerCase()} mode
                  </p>
                ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 group-hover:bg-[#059669] sm:w-auto sm:justify-start">
                    Switch to {mode.label.toLowerCase()}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
