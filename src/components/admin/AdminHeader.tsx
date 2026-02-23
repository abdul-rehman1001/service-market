"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
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
            email: data.user.email,
            profileImage: data.user.profileImage,
          });
        }
      })
      .catch(() => {
        // Silent fail
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
      <button className="lg:hidden" onClick={onMenuClick}>
        <Menu />
      </button>
      <h1 className="font-semibold">Service Market – Admin</h1>
      
      <Link
        href="/profile"
        className="flex items-center gap-3 group cursor-pointer"
        title="Go to Profile"
      >
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-gray-200 group-hover:ring-emerald-500 transition-all"
          />
        ) : user ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-gray-200 group-hover:ring-emerald-500 transition-all text-sm">
            {user.firstName[0]}{user.lastName[0]}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold shadow-sm ring-1 ring-gray-200 text-sm">
            A
          </div>
        )}
        <span className="text-sm text-slate-600 group-hover:text-emerald-600 transition-colors hidden md:block">
          {user?.email || 'admin@servicemarket.com'}
        </span>
      </Link>
    </header>
  );
}