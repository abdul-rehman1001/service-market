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
} from "lucide-react";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const revealParent = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      };

  const revealItem = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
      };

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* subtle decorative shapes (purely presentational) */}
      <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute right-8 top-0 h-80 w-80 rounded-full bg-emerald-50/40 blur-2xl animate-float-medium" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
          {/* LEFT: Headline + CTAs */}
          <motion.div
            variants={revealParent}
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "show"}
            viewport={reduceMotion ? undefined : { once: true, amount: 0.25 }}
          >
            <motion.h1
              variants={revealItem}
              className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Book trusted services near you with confidence.
            </motion.h1>

            <motion.p
              variants={revealItem}
              className="mt-4 max-w-2xl text-lg text-slate-600"
            >
              Tell us what you need, compare nearby providers, and book the right professional without any hassle.
            </motion.p>

            <motion.div variants={revealItem} className="mt-8 flex flex-wrap gap-4">
              <Button
                href="/register/seeker"
                className="group inline-flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                aria-label="Find a service"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                aria-label="Become a provider"
              >
                Become a provider
                <BadgeCheck className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Key metrics */}
            <motion.div
              variants={revealItem}
              className="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <StatCard value="4.9/5" label="Average provider rating" />
              <StatCard value="500+" label="Local providers available" />
              <StatCard value="24/7" label="Search and booking access" />
            </motion.div>

            {/* trust features */}
            <motion.div
              variants={revealItem}
              className="mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-700"
            >
              <Feature icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />} text="Verified profiles" />
              <Feature icon={<MapPin className="h-4 w-4 text-emerald-600" />} text="Find Providers near you" />
              <Feature icon={<Star className="h-4 w-4 text-emerald-500" />} text="Rated by real customers" />
            </motion.div>
          </motion.div>

          {/* RIGHT: Live match preview card */}
          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={
              reduceMotion
                ? undefined
                : { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.08 } }
            }
            viewport={reduceMotion ? undefined : { once: true, amount: 0.25 }}
          >
            <div className="absolute -inset-6 rounded-3xl bg-emerald-50/50 blur-2xl" />
            <motion.div
              className="relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-[0_20px_60px_-20px_rgba(2,6,23,0.35)]"
              whileHover={reduceMotion ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              {/* header */}
              <div className="flex items-center justify-between rounded-2xl bg-emerald-800 px-5 py-3 text-white">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-200">Quick service match</div>
                  <div className="mt-1 text-sm font-semibold">Need wiring repair at home</div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">Matched</div>
              </div>

              {/* content */}
              <div className="mt-5 grid gap-4 lg:grid-cols-[1.06fr_0.94fr]">
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Top Match</div>
                      <div className="text-sm text-slate-500">Selected using your request, location, and availability</div>
                    </div>
                    <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Best Match</div>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    <Image
                      src="/images/service2.png"
                      alt="Professional service provider"
                      fill
                      style={{ objectFit: "cover" }}
                      priority
                      sizes="(min-width: 1024px) 560px, 100vw"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Provider Details</div>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <KeyValue label="Category" value="Electrician" />
                      <KeyValue label="Available" value="Today" valueClass="text-emerald-700 font-semibold" />
                      <KeyValue label="Response Time" value="Under 30 min" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">Why Choose Us</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Verified providers only
                      </li>
                      <li className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Matches based on your request
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                        Find providers near you
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div> {/* /container */}
    </section>
  );
}

/* -- small presentational subcomponents (keeps main component focused) -- */

function StatCard({ value, label }: { value: string; label: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </motion.div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function KeyValue({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${valueClass} text-slate-900`}>{value}</span>
    </div>
  );
}