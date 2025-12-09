"use client";

import {
  FaSearch,
  FaCheckCircle,
  FaCalendarCheck,
  FaUserPlus,
  FaBell,
  FaMoneyBill,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const seekers = [
    {
      icon: <FaSearch className="text-white text-2xl" />,
      title: "Describe Your Need",
      desc: "Tell us what you need done. Be as specific as possible.",
      color: "bg-blue-500",
    },
    {
      icon: <FaCheckCircle className="text-white text-2xl" />,
      title: "Get Matched",
      desc: "Our AI instantly finds the best local professional for your job.",
      color: "bg-blue-500",
    },
    {
      icon: <FaCalendarCheck className="text-white text-2xl" />,
      title: "Book & Relax",
      desc: "Choose your provider, book a time, and consider it done.",
      color: "bg-blue-500",
    },
  ];

  const providers = [
    {
      icon: <FaUserPlus className="text-white text-2xl" />,
      title: "Create Your Profile",
      desc: "Showcase your skills and services to attract new clients.",
      color: "bg-pink-500",
    },
    {
      icon: <FaBell className="text-white text-2xl" />,
      title: "Receive Leads",
      desc: "Get alerts when clients need your service, fast and easy.",
      color: "bg-pink-500",
    },
    {
      icon: <FaMoneyBill className="text-white text-2xl" />,
      title: "Get Hired & Paid",
      desc: "Accept the job and begin working on the assigned tasks.",
      color: "bg-pink-500",
    },
  ];

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, type: "spring" as const, stiffness: 120, damping: 20 },
    }),
  };

  return (
    <section className="py-20 bg-white">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          A simple, streamlined process for everyone involved.
        </p>
      </div>

      <div className="mt-12 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 px-4 sm:px-6 lg:px-8">
        {/* Service Seekers */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-8">For Service Seekers</h3>
          <div className="flex flex-col gap-6 w-full">
            {seekers.map((step, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stepVariants}
                className="flex items-start gap-4 p-4 md:p-6 bg-gray-50 rounded-xl hover:scale-105 transition-transform cursor-default"
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Service Providers */}
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-8">For Service Providers</h3>
          <div className="flex flex-col gap-6 w-full">
            {providers.map((step, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stepVariants}
                className="flex items-start gap-4 p-4 md:p-6 bg-gray-50 rounded-xl hover:scale-105 transition-transform cursor-default"
              >
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${step.color}`}>
                  {step.icon}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{step.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
