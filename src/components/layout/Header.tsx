"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "My Bookings", href: "/bookings" },
    { label: "Messages", href: "/messages" },
  ];

  return (
    <header className="w-full bg-[#f5f7f8] border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#009966] hover:opacity-80 transition">
          Servizo
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-[#009966]"
                  : "text-gray-600 hover:text-[#009966]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons / Buttons */}
        <div className="flex items-center gap-4">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
            U
          </div>

          {/* Logout Button */}
          <button
            className="flex items-center gap-2 text-white bg-[#009966] px-3 py-2 rounded-md hover:bg-[#007a52] transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-200 transition">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
