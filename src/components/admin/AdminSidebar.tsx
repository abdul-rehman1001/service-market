"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  ShieldCheck,
  Layers,
  Wrench,
  Calendar,
  Star,
  FileText,
  HelpCircle,
  X,
  ChevronRight,
} from "lucide-react";

const STAGGER_CLASSES = [
  "",
  "admin-stagger-1",
  "admin-stagger-2",
  "admin-stagger-3",
  "admin-stagger-4",
  "admin-stagger-5",
  "admin-stagger-6",
  "admin-stagger-7",
] as const;

const nav = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Provider Verification", href: "/admin/verification", icon: ShieldCheck },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Booking Management", href: "/admin/bookings", icon: Calendar },
  { label: "Review Management", href: "/admin/reviews", icon: Star },
  { label: "Content Management", href: "/admin/content", icon: FileText },
  { label: "Queries", href: "/admin/queries", icon: HelpCircle },
];

export default function AdminSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`admin-sidebar fixed inset-y-0 left-0 z-40 flex w-[17.5rem] flex-col text-white transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Brand */}
      <div className="relative z-10 border-b border-white/10 px-5 pb-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="group flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white shadow-lg ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/Servizo.jpeg"
                alt="Servizo logo"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="min-w-0 animate-admin-slide-in-left">
              <span className="block truncate text-base font-bold tracking-tight">
                Service Market
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-[var(--admin-beige)]/90">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-beige)] shadow-[0_0_6px_var(--admin-beige)]" />
                Admin Console
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar-nav relative z-10 flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          Main Menu
        </p>
        {nav.map((item, index) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`animate-admin-slide-in-left ${STAGGER_CLASSES[Math.min(index + 1, 7)]} group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 ${
                isActive
                  ? "admin-nav-active font-semibold text-white"
                  : "text-white/75 hover:bg-white/8 hover:text-white"
              }`}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[var(--admin-beige)] shadow-[0_0_8px_var(--admin-beige)]"
                  aria-hidden
                />
              )}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 text-[var(--admin-beige)]"
                    : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white"
                }`}
              >
                <item.icon size={17} strokeWidth={isActive ? 2.25 : 2} />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <ChevronRight
                size={14}
                className={`shrink-0 transition-all duration-200 ${
                  isActive
                    ? "translate-x-0 opacity-80"
                    : "opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-50"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
