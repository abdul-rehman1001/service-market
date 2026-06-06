'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  Search,
} from 'lucide-react';
import { switchAccountMode } from '@/lib/authEvents';

type ProfileTheme = 'light' | 'dashboard';

interface ProfileModeSwitcherProps {
  activeMode: string;
  canSwitchMode?: boolean;
  onSwitched?: () => void;
  theme?: ProfileTheme;
}

export default function ProfileModeSwitcher({
  activeMode,
  canSwitchMode = false,
  onSwitched,
  theme = 'light',
}: ProfileModeSwitcherProps) {
  const router = useRouter();
  const [loadingMode, setLoadingMode] = useState<'SEEKER' | 'PROVIDER' | null>(null);

  if (!canSwitchMode) {
    return null;
  }

  const normalizedMode = String(activeMode).toUpperCase();
  const isProvider = normalizedMode === 'PROVIDER';

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

  const isDashboard = theme === 'dashboard';

  const shellClass = isDashboard
    ? 'border-[#6FCF97]/35 bg-gradient-to-br from-[#1F6F5F]/8 via-white to-[#6FCF97]/10'
    : 'border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50';

  const iconWrapClass = isDashboard
    ? 'bg-[#1F6F5F] text-white shadow-[0_8px_20px_-12px_rgba(31,111,95,0.8)]'
    : 'bg-emerald-600 text-white shadow-[0_8px_20px_-12px_rgba(16,185,129,0.65)]';

  const titleClass = isDashboard ? 'text-[#1F6F5F]' : 'text-slate-900';
  const subtitleClass = isDashboard ? 'text-[#1F6F5F]/65' : 'text-slate-600';

  const modes = [
    {
      key: 'SEEKER' as const,
      label: 'Customer',
      description: 'Book services, manage bookings & messages',
      icon: Search,
    },
    {
      key: 'PROVIDER' as const,
      label: 'Provider',
      description: 'Manage services, availability & requests',
      icon: Briefcase,
    },
  ];

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6 ${shellClass}`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl ${
          isDashboard ? 'bg-[#6FCF97]/25' : 'bg-emerald-200/50'
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full blur-3xl ${
          isDashboard ? 'bg-[#2FA084]/15' : 'bg-teal-200/40'
        }`}
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapClass}`}
          >
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-base font-bold sm:text-lg ${titleClass}`}>
              Account mode
            </h3>
            <p className={`mt-1 max-w-md text-sm leading-relaxed ${subtitleClass}`}>
              One account, two experiences. Choose how you want to use Servizo right now.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:self-center ${
            isDashboard
              ? 'border border-[#6FCF97]/40 bg-white/80 text-[#1F6F5F]'
              : 'border border-emerald-200 bg-white/80 text-emerald-800'
          }`}
        >
          <span
            className={`h-2 w-2 animate-pulse rounded-full ${
              isDashboard ? 'bg-[#2FA084]' : 'bg-emerald-500'
            }`}
          />
          {isProvider ? 'Provider mode active' : 'Customer mode active'}
        </span>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {modes.map((mode) => {
          const isActive = normalizedMode === mode.key;
          const isLoading = loadingMode === mode.key;
          const Icon = mode.icon;

          const activeCardClass = isDashboard
            ? 'border-[#2FA084] bg-white shadow-[0_14px_30px_-22px_rgba(47,160,132,0.85)] ring-2 ring-[#6FCF97]/35'
            : 'border-emerald-500 bg-white shadow-[0_14px_30px_-22px_rgba(16,185,129,0.55)] ring-2 ring-emerald-100';

          const idleCardClass = isDashboard
            ? 'border-[#6FCF97]/30 bg-white/70 hover:border-[#2FA084]/60 hover:bg-white hover:shadow-md'
            : 'border-slate-200/80 bg-white/70 hover:border-emerald-300 hover:bg-white hover:shadow-md';

          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => handleSwitch(mode.key)}
              disabled={Boolean(loadingMode)}
              className={`group relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-300 sm:p-5 ${
                isActive ? activeCardClass : idleCardClass
              } ${loadingMode && !isLoading ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                    isActive
                      ? isDashboard
                        ? 'bg-[#2FA084] text-white'
                        : 'bg-emerald-600 text-white'
                      : isDashboard
                        ? 'bg-[#6FCF97]/20 text-[#1F6F5F] group-hover:bg-[#6FCF97]/30'
                        : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {isActive && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                      isDashboard
                        ? 'bg-[#6FCF97]/25 text-[#1F6F5F]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </span>
                )}
              </div>

              <h4
                className={`mt-4 text-base font-bold ${
                  isDashboard ? 'text-[#1F6F5F]' : 'text-slate-900'
                }`}
              >
                {mode.label}
              </h4>
              <p
                className={`mt-1 text-sm leading-relaxed ${
                  isDashboard ? 'text-[#1F6F5F]/70' : 'text-slate-600'
                }`}
              >
                {mode.description}
              </p>

              {!isActive && !loadingMode && (
                <span
                  className={`mt-4 inline-flex items-center text-sm font-semibold transition group-hover:translate-x-0.5 ${
                    isDashboard ? 'text-[#2FA084]' : 'text-emerald-600'
                  }`}
                >
                  Switch to {mode.label.toLowerCase()}
                  <ArrowLeftRight className="ml-1.5 h-4 w-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
