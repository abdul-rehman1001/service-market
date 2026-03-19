"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Fetch current user profile for avatar
    fetch('/api/profile')
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            profileImage: data.user.profileImage,
          });
        }
      })
      .catch(() => {
        // Silent fail - user might not be logged in
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Services", href: "/services" },
    { label: "My Bookings", href: "/bookings" },
    { label: "Messages", href: "/messages" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-emerald-600 hover:opacity-80 transition-all"
        >
          Servizo
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium relative transition-colors ${
                pathname === item.href
                  ? "text-emerald-600 after:content-[''] after:block after:w-full after:h-0.5 after:bg-emerald-600 after:rounded-full after:absolute after:-bottom-1"
                  : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons / Buttons */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Avatar - Clickable to Profile */}
          <Link
            href="/profile"
            className="group relative"
            title="Go to Profile"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-500 transition-all cursor-pointer"
              />
            ) : user ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-gray-200 group-hover:ring-emerald-500 transition-all cursor-pointer">
                {user.firstName[0]}{user.lastName[0]}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold shadow-inner ring-1 ring-gray-200 group-hover:ring-emerald-500 transition-all cursor-pointer">
                U
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white bg-emerald-600 px-3 py-2 rounded-md hover:bg-emerald-700 transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-all duration-200">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
