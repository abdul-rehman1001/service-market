"use client";

import Link from "next/link";
import Button from "../../ui/Button";
import { HiSparkles } from "react-icons/hi2";

export default function LandingHeader() {
  return (
    <header className="w-full bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3.5 px-6">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 transition-transform group-hover:scale-105">
            <HiSparkles className="text-white text-lg" />
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Servizo
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3">
          <Button
            href="/login"
            className="px-5 py-2 text-gray-600 hover:text-emerald-700 font-medium rounded-xl hover:bg-emerald-50 transition-all"
          >
            Login
          </Button>

          <Button
            href="/register"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-200 transition-all !text-white font-medium"
          >
            Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
}
