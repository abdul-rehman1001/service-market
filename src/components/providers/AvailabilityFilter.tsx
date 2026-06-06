'use client';

import { CalendarClock, Calendar, Clock, Loader2, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

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

const inputClassName =
  'h-12 w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 text-sm font-medium text-[#111827] outline-none transition duration-200 placeholder:text-[#6B7280] focus:border-[#10B981] focus:ring-4 focus:ring-[#D1FAE5] disabled:cursor-not-allowed disabled:bg-[#F9FAFB] disabled:opacity-60';

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
  const reduceMotion = useReducedMotion();
  const minDate = new Date().toISOString().split('T')[0];
  const canApply = Boolean(date && time) && !checking && !disabled;

  const showEmptyResults =
    isActive &&
    !checking &&
    resultCount === 0 &&
    totalCount !== undefined &&
    totalCount > 0;

  const showSuccessResults =
    isActive &&
    appliedLabel &&
    !checking &&
    resultCount !== undefined &&
    totalCount !== undefined &&
    !showEmptyResults;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Filter providers by availability"
      className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(17,24,39,0.06),0_8px_24px_rgba(17,24,39,0.04)]"
    >
      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D1FAE5] text-[#059669]">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold tracking-tight text-[#111827] sm:text-lg">
                Filter by availability
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
                Show only providers available at your chosen date and time.
              </p>
            </div>
          </div>

          {isActive && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-sm font-semibold text-[#6B7280] transition duration-200 hover:border-[#10B981] hover:bg-[#D1FAE5] hover:text-[#059669]"
            >
              <X className="h-4 w-4" />
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end lg:gap-4">
          <div className="space-y-2">
            <label
              htmlFor="availability-date"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]"
            >
              <Calendar className="h-3.5 w-3.5 text-[#10B981]" />
              Date
            </label>
            <input
              id="availability-date"
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={disabled || checking}
              className={inputClassName}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="availability-time"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]"
            >
              <Clock className="h-3.5 w-3.5 text-[#10B981]" />
              Time
            </label>
            <input
              id="availability-time"
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled || checking}
              className={inputClassName}
            />
          </div>

          <motion.button
            type="button"
            onClick={onApply}
            disabled={!canApply}
            whileHover={reduceMotion || !canApply ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion || !canApply ? undefined : { scale: 0.98 }}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)] transition duration-200 hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#6B7280] disabled:shadow-none lg:w-auto lg:min-w-[148px]"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Apply filter'
            )}
          </motion.button>
        </div>

        {/* Feedback */}
        <div className="mt-4 space-y-3">
          {error && (
            <div
              className="flex items-start gap-3 rounded-xl border border-[#EF4444]/20 bg-[#FEF2F2] px-4 py-3"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" />
              <p className="text-sm font-medium text-[#991B1B]">{error}</p>
            </div>
          )}

          {showSuccessResults && (
            <div className="flex items-start gap-3 rounded-xl border border-[#22C55E]/20 bg-[#F0FDF4] px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
              <p className="text-sm text-[#166534]">
                <span className="font-bold text-[#111827]">{resultCount}</span> of{' '}
                <span className="font-bold text-[#111827]">{totalCount}</span> providers
                available {appliedLabel}
              </p>
            </div>
          )}

          {showEmptyResults && (
            <div className="flex items-start gap-3 rounded-xl border border-[#F97316]/20 bg-[#FFF7ED] px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#F97316]" />
              <p className="text-sm font-medium text-[#9A3412]">
                No providers in this list are available at the selected date and time. Try
                another slot.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
