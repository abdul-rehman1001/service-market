"use client";

import { ReactNode } from "react";

export default function StatCard({
  title,
  value,
  icon,
  staggerClass = "",
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  staggerClass?: string;
}) {
  return (
    <div
      className={`animate-admin-fade-in-up ${staggerClass} flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:block sm:rounded-2xl sm:p-5`}
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:mb-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] sm:h-9 sm:w-9 sm:rounded-xl">
          {icon}
        </div>
        <p className="truncate text-xs font-semibold text-[#6B7280] sm:text-sm">{title}</p>
      </div>
      <p className="shrink-0 text-xl font-bold text-[#111827] sm:text-2xl md:text-3xl">
        {value}
      </p>
    </div>
  );
}
