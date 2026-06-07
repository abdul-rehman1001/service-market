"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { landingImages } from "@/lib/landing-images";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const revealParent = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
      };

  const revealItem = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };

  return (
    <section className="relative overflow-hidden bg-[#F5F7F8] py-10 sm:py-14 md:py-18 lg:py-24">
      {/* Subtle decorative background elements */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#D1FAE5]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#1E3A5F]/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* LEFT: Headline + CTAs */}
          <motion.div
            variants={revealParent}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={reduceMotion ? undefined : { once: true, amount: 0.25 }}
            className="flex flex-col items-center text-center sm:items-start sm:text-left"
          >
            <motion.h1
              variants={revealItem}
              className="mt-4 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-[#1E3A5F] sm:text-4xl sm:mx-0 lg:text-5xl"
            >
              Book trusted services{" "}
              <span className="text-[#10B981]">near you</span>{" "}
              with confidence.
            </motion.h1>

            <motion.p
              variants={revealItem}
              className="mt-4 max-w-2xl text-base leading-relaxed text-[#6B7280] sm:mt-5 sm:mx-0 sm:text-lg"
            >
              Tell us what you need, compare nearby providers, and book the right professional without any hassle. Verified, rated, and ready to help.
            </motion.p>

            <motion.div
              variants={revealItem}
              className="mt-7 flex w-full max-w-md flex-col flex-wrap gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-start sm:gap-4"
            >
              <Button
                href="/register/seeker"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#10B981] px-7 py-3.5 text-base font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-[#059669] hover:shadow-[0_6px_24px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[#D1FAE5] sm:w-auto"
                aria-label="Find a service"
              >
                Find a service
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-[#10B981] bg-white px-7 py-3.5 text-base font-semibold text-[#059669] transition-all duration-200 hover:bg-[#D1FAE5]/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#D1FAE5] sm:w-auto"
                aria-label="Become a provider"
              >
                Become a provider
                <BadgeCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Button>

              <Button
                href="/home"
                className="inline-flex w-full items-center justify-center rounded-xl px-7 py-3.5 text-base font-semibold text-[#6B7280] transition-colors hover:text-[#10B981] focus:outline-none focus:ring-4 focus:ring-[#D1FAE5] sm:w-auto"
                aria-label="Continue as guest"
              >
                Continue as guest
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={revealItem}
              className="mt-9 w-full sm:mt-10 sm:max-w-3xl"
            >
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_2px_8px_rgba(17,24,39,0.04)] sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] sm:grid-cols-3 sm:gap-4 sm:divide-x-0">
                  <StatCard value="4.9/5" label="Average rating" icon={<Star className="h-4 w-4 sm:h-5 sm:w-5" />} />
                  <StatCard value="500+" label="Providers" icon={<BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5" />} />
                  <StatCard value="24/7" label="Available now" icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5" />} />
                </div>
              </div>
            </motion.div>

            {/* Trust features */}
            <motion.div
              variants={revealItem}
              className="mt-5 grid w-full grid-cols-3 gap-2 text-sm sm:mt-8 sm:flex sm:flex-row sm:items-center sm:justify-start sm:gap-6"
            >
              <Feature icon={<ShieldCheck className="h-4 w-4" />} text="Verified profiles" />
              <Feature icon={<MapPin className="h-4 w-4" />} text="Find near you" />
              <Feature icon={<Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />} text="Real reviews" />
            </motion.div>
          </motion.div>

          {/* RIGHT: Preview card */}
          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={
              reduceMotion
                ? undefined
                : { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.05 } }
            }
            viewport={reduceMotion ? undefined : { once: true, amount: 0.25 }}
          >
            <div className="absolute -inset-4 rounded-3xl bg-[#10B981]/[0.06] blur-2xl sm:-inset-6" />

            <motion.div
              className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_40px_rgba(17,24,39,0.07)] sm:rounded-3xl sm:p-5"
              whileHover={reduceMotion ? undefined : { y: -4, boxShadow: "0 20px 50px rgba(16, 185, 129, 0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between rounded-xl bg-[#10B981] px-4 py-3 text-white">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#D1FAE5]/80">Quick service match</div>
                  <div className="mt-1 text-sm font-bold">Need wiring repair at home</div>
                </div>
                <motion.div
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold"
                  animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✓ Matched
                </motion.div>
              </div>

              {/* Content */}
              <div className="mt-4 grid gap-3 lg:grid-cols-[1.06fr_0.94fr]">
                <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="text-sm font-bold text-[#111827]">Top Match</div>
                    <span className="rounded-full border border-[#F59E0B]/30 bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold text-[#B45309]">
                      ⭐ Best
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#E5E7EB] ring-1 ring-[#E5E7EB]">
                    <Image
                      src={landingImages.service2}
                      alt="Professional service provider"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <motion.div
                    className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                  >
                    <div className="text-sm font-bold text-[#111827]">Provider Details</div>
                    <div className="mt-2 space-y-1.5 text-sm">
                      <KeyValue label="Category" value="Electrician" />
                      <KeyValue label="Available" value="Today" valueClass="text-[#059669] font-bold" />
                      <KeyValue label="Response" value="Under 30 min" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/20 p-3"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                      <Sparkles className="h-4 w-4 text-[#10B981]" />
                      Why Choose Us
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#374151] sm:text-sm">
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>Verified & certified</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>AI matched for you</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                        <span>Local & nearby</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="px-1.5 py-1 transition-all duration-300 sm:rounded-xl sm:border sm:border-[#E5E7EB] sm:bg-white sm:p-5 sm:shadow-[0_2px_8px_rgba(17,24,39,0.04)] sm:hover:border-[#10B981]/25 sm:hover:shadow-md"
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
        <div className="rounded-lg bg-[#D1FAE5] p-2 text-[#059669] sm:p-2.5">{icon}</div>
        <div className="sm:flex-1">
          <div className="text-base font-bold leading-none text-[#1E3A5F] sm:text-2xl">{value}</div>
          <div className="mt-1 text-[10px] font-medium leading-tight text-[#6B7280] sm:mt-0.5 sm:text-sm">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2.5 sm:text-left">
      <div className="rounded-lg bg-white p-2 text-[#10B981] shadow-sm ring-1 ring-[#E5E7EB]">
        {icon}
      </div>
      <span className="text-[10px] font-medium leading-tight text-[#374151] sm:text-sm">{text}</span>
    </div>
  );
}

function KeyValue({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2">
      <span className="font-medium text-[#6B7280]">{label}</span>
      <span className={`font-bold text-[#111827] ${valueClass}`}>{value}</span>
    </div>
  );
}
