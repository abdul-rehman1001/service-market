"use client";

import Link from "next/link";
import Button from "../ui/Button"; // adjust the path to your Button component

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
          Servizo
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-4">

          {/* Login Button */}
          <Button
            href="/login"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition"
          >
            Login
          </Button>

          {/* Sign Up Button (white text ensured) */}
          <Button
            href="/signup"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition !text-white"
          >
            Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
}
