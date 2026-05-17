"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  Search,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
  step: number;
}

const seekerSteps: Step[] = [
  {
    icon: <Search className="h-5 w-5 text-emerald-600" />,
    title: "Describe your problem",
    desc: "Tell us what you need in plain words. Our AI identifies the right service category and shows relevant providers near you.",
    step: 1,
  },
  {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    title: "Compare verified providers",
    desc: "View profiles, ratings, real-time availability, and filter by location, price, or experience.",
    step: 2,
  },
  {
    icon: <CalendarCheck2 className="h-5 w-5 text-emerald-600" />,
    title: "Book and track your service",
    desc: "Select a time slot, confirm the booking, chat with provider, track job status, and review after completion.",
    step: 3,
  },
];

const providerSteps: Step[] = [
  {
    icon: <UserRoundPlus className="h-5 w-5 text-emerald-600" />,
    title: "Register and verify",
    desc: "Complete registration, upload CNIC for verification, and add your certifications.",
    step: 1,
  },
  {
    icon: <BellRing className="h-5 w-5 text-emerald-600" />,
    title: "Receive booking requests",
    desc: "Get notified when customers book your services. Accept or reject within 30 minutes.",
    step: 2,
  },
  {
    icon: <WalletCards className="h-5 w-5 text-emerald-600" />,
    title: "Complete jobs and grow",
    desc: "Update job status, chat with customers, complete work, collect reviews, and build your reputation.",
    step: 3,
  },
];

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  const container: Variants | undefined = reduceMotion
    ? undefined
    : { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

  const item: Variants | undefined = reduceMotion
    ? undefined
    : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <motion.section
      id="how-it-works"
      className="bg-slate-50 py-16 sm:py-20 md:py-24"
      variants={container}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div variants={item} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            How it works
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Three simple steps for seekers and providers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Whether you need a service or provide one, our platform makes the entire process straightforward.
          </p>
        </motion.div>

        {/* Two-column panels */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <StepPanel
            label="For customers"
            icon={<Search className="h-4 w-4" />}
            steps={seekerSteps}
            variants={item}
          />
          <StepPanel
            label="For providers"
            icon={<UserRoundPlus className="h-4 w-4" />}
            steps={providerSteps}
            variants={item}
          />
        </div>
      </div>
    </motion.section>
  );
}

function StepPanel({
  label,
  icon,
  steps,
  variants,
}: {
  label: string;
  icon: React.ReactNode;
  steps: Step[];
  variants?: Variants;
}) {
  return (
    <motion.div
      variants={variants}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
        {icon}
        {label}
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.step}
            className="group flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:border-emerald-100 hover:bg-emerald-50/40 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
              {step.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
                  Step {step.step}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{step.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
