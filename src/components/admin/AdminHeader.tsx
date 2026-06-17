"use client";

import { CalendarDays, LogOut, Menu, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

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
  const router = useRouter();
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
    const loadProfile = async () => {
      try {
        const res = await authenticatedFetch("/api/profile");
        if (!res.ok) return;

        const data = await res.json();
        if (data?.user) {
          setUser({
            id: data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            email: data.user.email,
            profileImage: data.user.profileImage,
          });
        }
      } catch {
        // Silent fail
      }
    };

    void loadProfile();
  }, []);

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Administrator";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="admin-header sticky top-0 z-30 border-b border-[#E5E7EB]/80 bg-white/90 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
        {/* Left: menu + page context */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#1E3A5F] shadow-sm transition-all duration-200 hover:border-[#10B981]/40 hover:bg-[#F5F7F8] hover:shadow-md active:scale-[0.98] lg:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={2.25} />
          </button>

          <div className="min-w-0 border-l border-[#E5E7EB] pl-3 sm:pl-4 lg:border-l-0 lg:pl-0">
            <div className="mb-0.5 hidden items-center gap-1.5 sm:flex">
              <Shield className="h-3 w-3 text-[#10B981]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#059669]">
                Admin Console
              </span>
            </div>
            <h1 className="truncate text-base font-bold tracking-tight text-[#1E3A5F] sm:text-xl">
              {pageTitle}
            </h1>
            <div className="mt-1 hidden items-center gap-2 sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-0.5 text-[11px] font-medium text-[#6B7280]">
                <CalendarDays className="h-3 w-3 text-[#10B981]" />
                {today}
              </span>
              <span className="hidden text-[11px] text-[#9CA3AF] md:inline">
                Manage your platform with ease
              </span>
            </div>
          </div>
        </div>

        {/* Right: profile + logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            href="/admin/profile"
            className="group flex max-w-[12rem] items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white py-1.5 pl-1.5 pr-2.5 shadow-[0_2px_10px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/35 hover:shadow-[0_8px_24px_rgba(16,185,129,0.10)] sm:max-w-none sm:gap-2.5 sm:pr-3 lg:pr-4"
            title="Open Admin Profile"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={displayName}
                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-[#E5E7EB] transition-all group-hover:ring-[#10B981]/40 sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#10B981] text-xs font-bold text-white shadow-sm ring-2 ring-[#E5E7EB] transition-all group-hover:ring-[#10B981]/40 sm:h-10 sm:w-10 sm:text-sm">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : "A"}
              </div>
            )}
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[7.5rem] truncate text-sm font-semibold text-[#1E3A5F] transition-colors group-hover:text-[#059669] lg:max-w-[9rem]">
                {displayName}
              </p>
              <p className="max-w-[7.5rem] truncate text-[10px] text-[#6B7280] lg:max-w-[11rem] lg:text-[11px]">
                {user?.email || "admin@servicemarket.com"}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full border border-[#D1FAE5] bg-[#ECFDF5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#059669] xl:inline">
              Admin
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#374151] shadow-sm transition-all duration-200 hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#EF4444] active:scale-[0.98] sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3.5 sm:py-2"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={15} className="sm:text-[#6B7280]" />
            <span className="hidden text-sm font-semibold sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
