"use client";

import { motion, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export default function CTA() {
  const reduceMotion = useReducedMotion();

  const container = reduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      };

  const item = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 18 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
      };

  return (
    <motion.section
      className="relative overflow-hidden bg-white py-20 md:py-28"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-8 py-14 text-center shadow-[0_30px_90px_-30px_rgba(2,6,23,0.55)] md:px-14 md:py-16"
          variants={item}
          whileHover={reduceMotion ? undefined : { y: -4 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
        >

          {/* subtle glow accents */}
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl animate-float-medium" />

          <motion.div className="relative" variants={container}>
            {/* Badge */}
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-300 backdrop-blur"
            >
              
              Join our growing community
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={item}
              className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-5xl"
            >
              Ready to get started?
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={item}
              className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300"
            >
              Join thousands of satisfied customers and verified professionals.
              Discover trusted services or grow your business with Servizo today.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
            >

              {/* Primary CTA */}
              <Button
                href="/register/seeker"
                aria-label="Find a service"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 sm:w-auto"
              >
                Find a service
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>

              {/* Secondary CTA */}
              <Button
                href="/register/provider"
                aria-label="Become a provider"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-white/30 sm:w-auto"
              >
                Become a provider
                <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
              </Button>

            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}