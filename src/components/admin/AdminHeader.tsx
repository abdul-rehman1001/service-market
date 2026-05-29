"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Analytics Dashboard",
  "/admin/profile": "Admin Profile",
  "/admin/users": "User Management",
  "/admin/verification": "Provider Verification",
  "/admin/categories": "Categories",
  "/admin/services": "Services",
  "/admin/bookings": "Booking Management",
  "/admin/reviews": "Review Management",
  "/admin/content": "Content Management",
  "/admin/queries": "Queries",
};

function getPageTitle(pathname: string): string {
  const match = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return match?.[1] ?? "Admin";
}

export default function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    []
  );

  useEffect(() => {
    fetch("/api/profile")
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

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Administrator";

  return (
    <header className="admin-header relative sticky top-0 z-30 px-4 py-3 sm:px-6 sm:py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: menu + page context */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-beige)]/60 bg-white text-[var(--admin-green-dark)] shadow-sm transition-all duration-200 hover:border-[var(--admin-green)] hover:bg-[var(--admin-green-muted)] hover:shadow-md lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>

          <div className="min-w-0 border-l border-[var(--admin-beige)]/40 pl-3 sm:pl-4 lg:border-l-0 lg:pl-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--admin-green-dark)] sm:text-xl">
              {pageTitle}
            </h1>
            <p className="mt-0.5 hidden text-xs text-[var(--admin-green)]/65 sm:block">
              {today} · Manage your platform with ease
            </p>
          </div>
        </div>

        {/* Right: profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/admin/profile"
            className="group flex items-center gap-2.5 rounded-2xl border border-[var(--admin-beige)]/50 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all duration-300 hover:border-[var(--admin-green)]/50 hover:shadow-lg sm:gap-3 sm:pr-4"
            title="Open Admin Profile"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={displayName}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-[var(--admin-beige)]/80 transition-all group-hover:ring-[var(--admin-green)]"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-green)] via-[var(--admin-green)] to-[var(--admin-green-dark)] text-sm font-bold text-white shadow-inner ring-2 ring-[var(--admin-beige)]/80 transition-all group-hover:ring-[var(--admin-green)]">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : "A"}
              </div>
            )}
            <div className="hidden min-w-0 text-left md:block">
              <p className="truncate text-sm font-semibold text-[var(--admin-green-dark)] transition-colors group-hover:text-[var(--admin-green)]">
                {displayName}
              </p>
              <p className="truncate text-[11px] text-[var(--admin-green)]/70">
                {user?.email || "admin@servicemarket.com"}
              </p>
            </div>
            <span className="ml-0.5 hidden rounded-md bg-gradient-to-r from-[var(--admin-green-dark)] to-[var(--admin-green)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm lg:inline">
              Admin
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
