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
      className={`admin-card animate-admin-fade-in-up ${staggerClass} flex items-center gap-4 rounded-2xl p-5`}
    >
      <div className="rounded-xl bg-[var(--admin-green-muted)] p-3 text-[var(--admin-green)] transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-green)]/70">{title}</p>
        <p className="text-2xl font-bold tracking-tight text-[var(--admin-green-dark)] sm:text-3xl">
          {value}
        </p>
      </div>
    </div>
  );
}
