"use client";

import { ReactNode } from "react";
import { FaShieldAlt, FaBolt, FaUsers, FaTools } from "react-icons/fa";
import { motion, Variants } from "framer-motion";

export default function Features() {
  const features: {
    icon: ReactNode;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      icon: <FaBolt className="text-xl" />,
      title: "AI-Powered Matching",
      description:
        "Our intelligent AI connects you with the perfect provider in seconds — no more endless searching.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: <FaShieldAlt className="text-xl" />,
      title: "Verified Providers",
      description:
        "Every provider is vetted and verified so you can hire with complete confidence.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: <FaTools className="text-xl" />,
      title: "Easy Booking",
      description:
        "Book any service in just a few clicks. Simple scheduling, instant confirmation.",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: <FaUsers className="text-xl" />,
      title: "Simple Management",
      description:
        "Track bookings, manage schedules, and communicate — all from one clean dashboard.",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 20,
      },
    },
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/30 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-100 rounded-full opacity-20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-blue-100 rounded-full opacity-20 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm tracking-wider uppercase mb-3">
            Why Servizo
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              All in One Place
            </span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-base md:text-lg">
            Discover powerful features that make finding and providing services
            easier than ever before.
          </p>
        </div>

        {/* Feature cards */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {features.map((feature, idx) => (
            <motion.div key={idx} variants={cardVariants}>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 hover:border-emerald-100 h-full">
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${feature.iconBg} ${feature.iconColor} rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}
                >
                  {feature.icon}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
