"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BrainCircuit,
  CalendarClock,
  CircleCheckBig,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function Features() {
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
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
      };

  const features: Feature[] = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-emerald-600" />,
      title: "AI-Powered Search",
      description:
        "Describe your problem in plain English. Our AI automatically identifies the right service category and matches you with qualified providers.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-600" />,
      title: "Verified Providers",
      description:
        "All service providers are verified with CNIC and undergo admin approval. Only trusted professionals are listed on our platform.",
    },
    {
      icon: <CalendarClock className="h-6 w-6 text-emerald-600" />,
      title: "Real-Time Booking",
      description:
        "View provider availability instantly, select your preferred time slot, and book services directly. No back-and-forth needed.",
    },
    {
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      title: "Authentic Reviews",
      description:
        "Read real reviews from verified customers. Rate providers on professionalism, quality, punctuality, and communication.",
    },
    {
      icon: <SlidersHorizontal className="h-6 w-6 text-emerald-600" />,
      title: "Location-Based Search",
      description:
        "Find providers near you using our map search. Set your preferred radius (1-20 km) and see available providers in your area.",
    },
    {
      icon: <CircleCheckBig className="h-6 w-6 text-emerald-600" />,
      title: "Real-Time Chat",
      description:
        "Chat directly with service providers before and during the job. Get instant clarification and updates on job status.",
    },
  ];

  return (
    <motion.section
      className="relative bg-white py-20 md:py-28"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div variants={item} className="mx-auto max-w-3xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            Key Features
          </div>

          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 md:text-5xl">
            Everything you need to find and hire professionals
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            From AI-powered search to verified providers, real-time booking to authentic reviews.
            We've built features that make finding services simple and reliable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
              variants={item}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {/* Icon */}
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}