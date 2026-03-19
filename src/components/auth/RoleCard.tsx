"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RoleCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export default function RoleCard({
  href,
  title,
  description,
  icon,
}: RoleCardProps) {
  return (
    <Link href={href} className="flex-1">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="group relative flex h-full cursor-pointer flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:border-emerald-500 hover:shadow-lg"
      >
        {/* Icon container */}
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-2xl text-emerald-600 transition group-hover:bg-emerald-100">
          {icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-500">
          {description}
        </p>

        {/* Hover indicator */}
        <span className="absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl bg-emerald-500 transition-all duration-300 group-hover:w-full" />
      </motion.div>
    </Link>
  );
}