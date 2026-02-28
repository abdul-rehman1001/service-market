"use client";

import Button from "../ui/Button";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50/30 via-white to-emerald-50/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-16 -left-16 w-[300px] h-[300px] bg-emerald-100 rounded-full opacity-20 blur-[80px] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-12 md:p-16 text-center shadow-2xl shadow-emerald-200"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <HiSparkles className="text-yellow-300" />
              Join the Community
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Get Started?
            </h2>

            <p className="text-emerald-100 mt-4 md:mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Join thousands of users already on Servizo. Whether you&apos;re
              looking for help or aiming to grow your business — your journey
              starts here.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Button
                href="/register/seeker"
                className="group bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg px-8 py-3.5 text-base rounded-xl font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Find a Service Now
                <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                href="/register/provider"
                className="group bg-transparent text-white border-2 border-white/30 hover:border-white/60 hover:bg-white/10 px-8 py-3.5 text-base rounded-xl font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Become a Provider
                <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
