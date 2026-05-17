"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import { landingImages } from "@/lib/landing-images";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const fade: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
      };

  const stagger: Variants | undefined = reduceMotion
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };

  const floatCard: Variants | undefined = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
      };

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="animate-float-slow absolute -left-24 top-16 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="animate-float-medium absolute right-[-5rem] top-24 h-80 w-80 rounded-full bg-slate-100 blur-3xl" />
        <div className="animate-float-slow absolute bottom-[-7rem] left-1/3 h-72 w-72 rounded-full bg-emerald-50 blur-3xl [animation-delay:1.5s]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left column */}
          <motion.div
            variants={stagger}
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            className="order-2 lg:order-1 text-center md:text-left flex flex-col items-center md:items-start"
          >
            <motion.div variants={fade}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted by 500+ service seekers
              </span>
            </motion.div>

            <motion.h1
              variants={fade}
              className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.15]"
            >
              Book services
              <br />
              <span className="text-emerald-600">near you</span> with confidence.
            </motion.h1>

            <motion.p
              variants={fade}
              className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              Tell us what you need, compare verified providers nearby, and book
              the right professional, no hassle, no guesswork.
            </motion.p>

            <motion.div
              variants={fade}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button
                href="/register/seeker"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] sm:w-auto w-full"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button
                href="/register/provider"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 transition-all duration-200 hover:border-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] sm:w-auto w-full"
              >
                Become a provider
                <BadgeCheck className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fade}
              className="mt-10 grid grid-cols-3 gap-3 sm:gap-4 w-full"
            >
              <StatCard icon={<Star className="h-4 w-4 text-emerald-600" />} value="4.9/5" label="Avg rating" />
              <StatCard icon={<BadgeCheck className="h-4 w-4 text-emerald-600" />} value="500+" label="Verified pros" />
              <StatCard icon={<MapPin className="h-4 w-4 text-emerald-600" />} value="24/7" label="Available" />
            </motion.div>

            {/* Trust chips */}
            <motion.div
              variants={fade}
              className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3"
            >
              <TrustChip icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} text="Verified profiles" />
              <TrustChip icon={<MapPin className="h-4 w-4 text-emerald-600" />} text="Near-you matching" />
              <TrustChip icon={<Star className="h-4 w-4 text-emerald-600" />} text="Real customer reviews" />
            </motion.div>
          </motion.div>

          {/* Right column — preview card */}
          <motion.div
            variants={floatCard}
            className="relative order-1 lg:order-2"
            initial={reduceMotion ? false : "hidden"}
            animate={reduceMotion ? undefined : "show"}
          >
            <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 sm:rounded-3xl">
              {/* Card header */}
              <div className="flex items-center justify-between bg-emerald-600 px-5 py-3.5 text-white sm:px-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-100">Quick match</p>
                  <p className="mt-0.5 text-sm font-bold sm:text-base">Need wiring repair at home</p>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  Matched
                </span>
              </div>

              {/* Card body */}
              <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Image */}
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Top Match</p>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      Best fit
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={landingImages.service2}
                      alt="Professional service provider"
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority
                      sizes="(min-width: 1024px) 400px, 100vw"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <p className="text-sm font-bold text-slate-900">Provider Details</p>
                    <div className="mt-2.5 space-y-2">
                      <DetailRow label="Category" value="Electrician" />
                      <DetailRow label="Available" value="Today" highlight />
                      <DetailRow label="Response" value="Under 30 min" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                    <p className="text-sm font-bold text-slate-900">Why Servizo</p>
                    <ul className="mt-2.5 space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        Verified &amp; certified providers
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        AI-matched to your request
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        Local providers nearby
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 text-center shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-4">
      <div className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
        {icon}
      </div>
      <p className="text-lg font-extrabold text-slate-900 sm:text-xl">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function TrustChip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
      {icon}
      {text}
    </span>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}
