"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Button from "../../ui/Button";
import { ArrowRight, Menu, X } from "lucide-react";
import { landingImages } from "@/lib/landing-images";

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isInfoPage =
    pathname === "/landing/about" ||
    pathname === "/landing/faq" ||
    pathname === "/landing/terms" ||
    pathname === "/landing/privacy";

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
        <Link href="/landing" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
          <Image
            src={landingImages.logo}
            alt="Servizo Logo"
            width={44}
            height={44}
            className="h-10 w-auto sm:h-11"
          />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B7280] sm:block">
            Service marketplace
          </span>
        </Link>

        {!isInfoPage && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B7280] md:flex">
            <Link href="/landing#features" className="transition-colors hover:text-[#10B981]">Features</Link>
            <Link href="/landing#how-it-works" className="transition-colors hover:text-[#10B981]">How It Works</Link>
            <Link href="/landing#testimonials" className="transition-colors hover:text-[#10B981]">Testimonials</Link>
          </nav>
        )}

        <div className="hidden items-center gap-2.5 md:flex">
          <Button
            href="/home"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#10B981]"
          >
            Continue as guest
          </Button>

          <Button
            href="/login"
            className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#111827] transition-all hover:border-[#10B981]/30 hover:bg-[#F9FAFB]"
          >
            Login
          </Button>

          <Button
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition-all hover:bg-[#059669] hover:shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
          >
            Sign Up
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>

        {!isInfoPage && (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#111827] transition hover:bg-[#F9FAFB] md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {!isInfoPage && mobileOpen && (
        <div className="border-t border-[#E5E7EB] bg-white md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6 text-center">
            <Link href="/landing#features" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]">Features</Link>
            <Link href="/landing#how-it-works" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]">How It Works</Link>
            <Link href="/landing#testimonials" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB]">Testimonials</Link>
            <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-4">
              <Button href="/home" className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#111827]">
                Continue as guest
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button href="/login" className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[#111827]">Login</Button>
                <Button href="/register" className="w-full rounded-xl bg-[#10B981] px-4 py-2.5 text-center text-sm font-semibold text-white">Sign Up</Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
