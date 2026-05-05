"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Button from "../../ui/Button";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isInfoPage =
    pathname === "/landing/about" ||
    pathname === "/landing/faq" ||
    pathname === "/landing/terms" ||
    pathname === "/landing/privacy";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/landing" className="group flex items-center gap-3 hover:opacity-80 transition-all">
          <Image
            src="/images/Servizo.jpeg"
            alt="Servizo Logo"
            width={50}
            height={50}
            className="h-12 w-auto"
          />
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Service marketplace</span>
          </div>
        </Link>

        {!isInfoPage && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <Link href="/landing#features" className="transition hover:text-emerald-700">Features</Link>
            <Link href="/landing#how-it-works" className="transition hover:text-emerald-700">How It Works</Link>
            <Link href="/landing#testimonials" className="transition hover:text-emerald-700">Testimonials</Link>
          </nav>
        )}

        <div className="hidden items-center gap-3 md:flex">
          <Button
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            Login
          </Button>

          <Button
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
          >
            Sign Up
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {!isInfoPage && (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {!isInfoPage && mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            <Link href="/landing#features" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Features</Link>
            <Link href="/landing#how-it-works" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">How It Works</Link>
            <Link href="/landing#testimonials" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Testimonials</Link>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button href="/login" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700">Login</Button>
              <Button href="/register" className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white">Sign Up</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
