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
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex-1 p-5 border rounded-2xl cursor-pointer hover:border-blue-500 transition bg-white shadow-sm"
    >
      <Link href={href} className="flex flex-col items-center gap-3 text-center">
        <div className="text-3xl text-blue-600">{icon}</div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </Link>
    </motion.div>
  );
}
