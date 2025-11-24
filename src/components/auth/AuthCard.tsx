"use client";
import { motion } from "framer-motion";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-white shadow-lg rounded-3xl p-8 border border-gray-200"
    >
      {children}
    </motion.div>
  );
}
