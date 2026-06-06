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
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-emerald-50 py-8 sm:py-12 md:py-16 lg:py-20">
      {/* Premium decorative gradient shapes */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-50/40 blur-3xl animate-float-medium" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-emerald-200/20 blur-2xl animate-float-slow" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] items-center">
          {/* LEFT: Headline + CTAs */}
          <motion.div
            variants={revealParent}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={reduceMotion ? undefined : { once: true, amount: 0.25 }}
          >
            {/* Premium badge */}
            <motion.div
              variants={revealItem}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur-sm border border-emerald-200"
            >
              <Zap className="h-4 w-4" />
              <span>Trusted by thousands of users</span>
            </motion.div>

            <motion.h1
              variants={revealItem}
              className="mt-3 sm:mt-4 max-w-4xl text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 tracking-tight"
            >
              Book trusted services{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                near you
              </span>{" "}
              with confidence.
            </motion.h1>

            <motion.p
              variants={revealItem}
              className="mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed"
            >
              Tell us what you need, compare nearby providers, and book the right professional without any hassle. Verified, rated, and ready to help.
            </motion.p>

            <motion.div
              variants={revealItem}
              className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
            >
              <Button
                href="/register/seeker"
                className="group inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-xl bg-emerald-600 px-6 sm:px-8 py-3 sm:py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-emerald-200 w-full sm:w-auto"
                aria-label="Find a service"
              >
                Find a service
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-xl border-2 border-emerald-600 bg-white px-6 sm:px-8 py-3 sm:py-3.5 text-base font-semibold text-emerald-600 hover:bg-emerald-50 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200 w-full sm:w-auto"
                aria-label="Become a provider"
              >
                Become a provider
                <BadgeCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
              </Button>

              <Button
                href="/home"
                className="inline-flex items-center justify-center rounded-xl px-6 sm:px-8 py-3 sm:py-3.5 text-base font-semibold text-slate-600 transition hover:text-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 w-full sm:w-auto"
                aria-label="Continue as guest"
              >
                Continue as guest
              </Button>
            </motion.div>

            {/* Key metrics grid */}
            <motion.div
              variants={revealItem}
              className="mt-8 sm:mt-9 grid max-w-3xl grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
            >
              <StatCard value="4.9/5" label="Average rating" icon={<Star className="h-5 w-5" />} />
              <StatCard value="500+" label="Verified providers" icon={<BadgeCheck className="h-5 w-5" />} />
              <StatCard value="24/7" label="Available now" icon={<Zap className="h-5 w-5" />} />
            </motion.div>

            {/* Trust features */}
            <motion.div
              variants={revealItem}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 text-sm text-slate-700"
            >
              <Feature icon={<ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />} text="Verified profiles" />
              <Feature icon={<MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0" />} text="Find near you" />
              <Feature icon={<Star className="h-5 w-5 text-emerald-600 flex-shrink-0" />} text="Real reviews" />
            </motion.div>
          </motion.div>

          {/* RIGHT: Live match preview card */}
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
            {/* Glow effect */}
            <div className="absolute -inset-6 sm:-inset-8 rounded-3xl bg-gradient-to-br from-emerald-100/40 to-emerald-50/40 blur-2xl opacity-70" />
            
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/95 backdrop-blur-md p-4 shadow-2xl"
              whileHover={reduceMotion ? undefined : { y: -6, boxShadow: "0 30px 80px rgba(16, 185, 129, 0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header badge */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-white shadow-md">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-100 font-semibold">Quick service match</div>
                  <div className="mt-1.5 text-sm font-bold text-white">Need wiring repair at home</div>
                </div>
                <motion.div
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white border border-white/30"
                  animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✓ Matched
                </motion.div>
              </div>

              {/* Content grid */}
              <div className="mt-4 grid gap-3 lg:grid-cols-[1.06fr_0.94fr]">
                {/* Image section */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/50 bg-gradient-to-br from-slate-50 to-emerald-50 p-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">Top Match</div>
                      <div className="text-xs text-slate-600 mt-0.5">Selected by AI algorithm</div>
                    </div>
                    <motion.div
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200"
                      animate={reduceMotion ? undefined : { scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    >
                      ⭐ Best
                    </motion.div>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-emerald-100/30">
                    <Image
                      src="/images/service2.png"
                      alt="Professional service provider"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                      sizes="(min-width: 1024px) 560px, 100vw"
                      className="hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Details section */}
                <div className="space-y-2.5 sm:space-y-3">
                  <motion.div
                    className="rounded-2xl border border-slate-100/80 bg-white/90 p-3 shadow-sm hover:shadow-md transition-shadow"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                  >
                    <div className="text-xs sm:text-sm font-bold text-slate-900">Provider Details</div>
                    <div className="mt-2 sm:mt-2.5 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-600">
                      <KeyValue label="Category" value="Electrician" />
                      <KeyValue label="Available" value="Today" valueClass="text-emerald-700 font-bold" />
                      <KeyValue label="Response" value="Under 30 min" />
                    </div>
                  </motion.div>

                  <motion.div
                    className="rounded-2xl border border-emerald-100/50 bg-gradient-to-br from-emerald-50/80 to-white p-3 shadow-sm hover:shadow-md transition-shadow"
                    whileHover={reduceMotion ? undefined : { y: -2 }}
                  >
                    <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      Why Choose Us
                    </div>
                    <ul className="mt-2 sm:mt-2.5 space-y-1.5 text-xs sm:text-sm text-slate-700">
                      <li className="flex items-start gap-2 hover:translate-x-1 transition-transform">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>Verified & certified</span>
                      </li>
                      <li className="flex items-start gap-2 hover:translate-x-1 transition-transform">
                        <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>AI matched for you</span>
                      </li>
                      <li className="flex items-start gap-2 hover:translate-x-1 transition-transform">
                        <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
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

/* -- Premium subcomponents with enhanced styling -- */

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="group relative rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300"
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{value}</div>
          <div className="mt-1 text-xs sm:text-sm text-slate-700 font-medium">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 group"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="p-2 rounded-lg bg-emerald-100/50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
        {icon}
      </div>
      <span className="font-medium text-slate-800">{text}</span>
    </motion.div>
  );
}

function KeyValue({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <motion.div
      className="flex items-center justify-between rounded-lg bg-slate-50/50 hover:bg-slate-100/50 px-3 sm:px-4 py-2 sm:py-3 transition-colors group"
      whileHover={{ x: 2 }}
    >
      <span className="text-xs sm:text-sm text-slate-700 font-medium">{label}</span>
      <span className={`text-xs sm:text-sm font-bold ${valueClass} text-emerald-600`}>{value}</span>
    </motion.div>
  );
}