'use client';

import { CalendarClock, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

type AvailabilityFilterProps = {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  isActive: boolean;
  checking: boolean;
  error: string | null;
  appliedLabel?: string | null;
  resultCount?: number;
  totalCount?: number;
  disabled?: boolean;
};

export default function AvailabilityFilter({
  date,
  time,
  onDateChange,
  onTimeChange,
  onApply,
  onClear,
  isActive,
  checking,
  error,
  appliedLabel,
  resultCount,
  totalCount,
  disabled = false,
}: AvailabilityFilterProps) {
  const minDate = new Date().toISOString().split('T')[0];
  const canApply = Boolean(date && time) && !checking && !disabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              Filter by availability
            </h3>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Show only providers available at your chosen date and time.
            </p>
          </div>
        </div>

        {isActive && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div className="space-y-1.5">
          <label
            htmlFor="availability-date"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Date
          </label>
          <input
            id="availability-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={disabled || checking}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="availability-time"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Time
          </label>
          <input
            id="availability-time"
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            disabled={disabled || checking}
            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          type="button"
          onClick={onApply}
          disabled={!canApply}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            'Apply filter'
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}

      {isActive && appliedLabel && !checking && resultCount !== undefined && totalCount !== undefined && (
        <p className="mt-3 text-sm text-emerald-800">
          <span className="font-semibold">{resultCount}</span> of{' '}
          <span className="font-semibold">{totalCount}</span> providers available{' '}
          {appliedLabel}
        </p>
      )}

      {isActive &&
        !checking &&
        resultCount === 0 &&
        totalCount !== undefined &&
        totalCount > 0 && (
        <p className="mt-3 text-sm text-amber-800">
          No providers in this list are available at the selected date and time. Try another slot.
        </p>
      )}
    </motion.div>
  );
}
