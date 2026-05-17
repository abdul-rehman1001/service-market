"use client";

import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import { ArrowRight, Zap } from "lucide-react";

export default function CTA() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  const item = reduceMotion
    ? undefined
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const halo = reduceMotion
    ? undefined
    : { animate: { scale: [1, 1.08, 1], opacity: [0.2, 0.32, 0.2] }, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <motion.section
      className="bg-slate-50 py-16 sm:py-20 md:py-24"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-6 py-12 text-center shadow-xl sm:rounded-3xl sm:px-10 md:px-16 md:py-16"
        >
          {/* Subtle decorative circles */}
          <motion.div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-2xl" aria-hidden {...halo} />
          <motion.div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-emerald-500/8 blur-2xl" aria-hidden {...halo} />

          <div className="relative">
            <motion.span
              variants={item}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-semibold text-emerald-300"
            >
              <Zap className="h-3.5 w-3.5" />
              Join our growing community
            </motion.span>

            <motion.h2
              variants={item}
              className="mx-auto mt-6 max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl"
            >
              Ready to get started?
            </motion.h2>

            <motion.p
              variants={item}
              className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg"
            >
              Join thousands of satisfied customers and verified professionals.
              Discover trusted services or grow your business with Servizo today.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4"
            >
              <Button
                href="/register/seeker"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98] sm:w-auto"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>

              <Button
                href="/register/provider"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white bg-white px-8 py-3.5 text-base font-semibold text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-[0.98] sm:w-auto"
              >
                Become a provider
                <Zap className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
