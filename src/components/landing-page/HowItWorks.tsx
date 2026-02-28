"use client";

import {
  FaSearch,
  FaCheckCircle,
  FaCalendarCheck,
  FaUserPlus,
  FaBell,
  FaMoneyBill,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface Step {
  icon: ReactNode;
  title: string;
  desc: string;
  step: number;
}

export default function HowItWorks() {
  const seekers: Step[] = [
    {
      icon: <FaSearch className="text-emerald-600 text-xl" />,
      title: "Describe Your Need",
      desc: "Tell us what you need done. Be as specific as possible.",
      step: 1,
    },
    {
      icon: <FaCheckCircle className="text-emerald-600 text-xl" />,
      title: "Get Matched",
      desc: "Our AI instantly finds the best local professional for your job.",
      step: 2,
    },
    {
      icon: <FaCalendarCheck className="text-emerald-600 text-xl" />,
      title: "Book & Relax",
      desc: "Choose your provider, book a time, and consider it done.",
      step: 3,
    },
  ];

  const providers: Step[] = [
    {
      icon: <FaUserPlus className="text-blue-600 text-xl" />,
      title: "Create Your Profile",
      desc: "Showcase your skills and services to attract new clients.",
      step: 1,
    },
    {
      icon: <FaBell className="text-blue-600 text-xl" />,
      title: "Receive Leads",
      desc: "Get alerts when clients need your service, fast and easy.",
      step: 2,
    },
    {
      icon: <FaMoneyBill className="text-blue-600 text-xl" />,
      title: "Get Hired & Paid",
      desc: "Accept the job and begin working on the assigned tasks.",
      step: 3,
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
  };

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 120, damping: 20 },
    },
  };

  const renderSteps = (
    steps: Step[],
    accentColor: string,
    accentBg: string,
    lineColor: string
  ) => (
    <motion.div
      className="flex flex-col gap-0 w-full"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {steps.map((step, idx) => (
        <motion.div key={idx} variants={stepVariants} className="relative flex items-start gap-5">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full ${accentBg} flex items-center justify-center border-2 ${accentColor} z-10 relative`}
            >
              {step.icon}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-0.5 h-16 ${lineColor}`} />
            )}
          </div>

          {/* Content */}
          <div className="pt-1.5 pb-8">
            <span className={`text-xs font-bold uppercase tracking-wider ${accentColor} mb-1 block`}>
              Step {step.step}
            </span>
            <h4 className="font-bold text-gray-900 text-lg">{step.title}</h4>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{step.desc}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 -left-20 w-[350px] h-[350px] bg-emerald-100 rounded-full opacity-20 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 -right-16 w-[300px] h-[300px] bg-blue-100 rounded-full opacity-20 blur-[80px] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm tracking-wider uppercase mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            How It{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-base md:text-lg">
            A streamlined process designed for simplicity — whether you&apos;re
            seeking or offering services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
          {/* Service Seekers */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              <FaSearch className="text-xs" />
              For Service Seekers
            </div>
            {renderSteps(
              seekers,
              "border-emerald-200 text-emerald-600",
              "bg-emerald-50",
              "bg-emerald-200"
            )}
          </div>

          {/* Service Providers */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-8">
              <FaUserPlus className="text-xs" />
              For Service Providers
            </div>
            {renderSteps(
              providers,
              "border-blue-200 text-blue-600",
              "bg-blue-50",
              "bg-blue-200"
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
