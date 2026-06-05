"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import NotificationBell from "./NotificationBell";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

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
            role: data.user.role,
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

  const navItems =
    user?.role === 'PROVIDER'
      ? [
          { label: 'Home', href: '/home' },
          { label: 'Services', href: '/services' },
          { label: 'Messages', href: '/messages' },
          { label: 'Dashboard', href: '/provider/dashboard' },
        ]
      : [
          { label: 'Home', href: '/home' },
          { label: 'Services', href: '/services' },
          { label: 'My Bookings', href: '/bookings' },
          { label: 'Messages', href: '/messages' },
        ];

  const mobileMenu =
    mobileOpen && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] bg-slate-900/50 lg:hidden"
              aria-label="Close menu overlay"
              onClick={() => setMobileOpen(false)}
            />
            <nav
              className="fixed inset-y-0 left-0 z-[110] flex h-dvh w-[min(100%,20rem)] flex-col bg-white shadow-2xl lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
                <span className="text-base font-bold text-slate-900">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 transition hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-slate-700" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-xl px-4 py-3.5 text-base font-medium transition ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "text-slate-800 hover:bg-slate-50 hover:text-emerald-600"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </>,
          document.body
        )
      : null;

  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-white/95 shadow-[0_1px_0_0_rgba(226,232,240,0.9)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-slate-700 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 text-slate-600 sm:h-6 sm:w-6" />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-80 transition-all"
          >
            <Image
              src="/images/Servizo.jpeg"
              alt="Servizo Logo"
              width={40}
              height={40}
              className="h-9 w-auto sm:h-10"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          {user && <NotificationBell />}

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
            type="button"
            onClick={handleLogout}
            className="hidden items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-2 text-white shadow-sm transition hover:bg-emerald-700 sm:gap-2 sm:px-3 lg:flex"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
    {mobileMenu}
    </>
  );
}
