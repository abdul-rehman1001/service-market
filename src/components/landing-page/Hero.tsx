"use client";

import Button from "../ui/Button";
import { motion } from "framer-motion";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-16 pb-24 md:pt-24 md:pb-32">
      {/* Decorative floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-200 rounded-full opacity-30 blur-[80px] animate-float-slow" />
        <div className="absolute top-1/3 -right-16 w-72 h-72 bg-blue-200 rounded-full opacity-30 blur-[80px] animate-float-medium" />
        <div className="absolute bottom-10 left-1/4 w-56 h-56 bg-teal-100 rounded-full opacity-40 blur-[60px] animate-float-fast" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-emerald-100 rounded-full opacity-25 blur-[50px] animate-float-slow" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "radial-gradient(circle, #059669 1px, transparent 1px)", backgroundSize: "32px 32px"}} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
        >
          <HiSparkles className="text-emerald-500" />
          <span>AI-Powered Service Marketplace</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
        >
          The Smart Way to{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Find
            </span>
          </span>{" "}
          &{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Offer
            </span>
          </span>{" "}
          Services
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
        >
          Connect with verified professionals effortlessly. Whether you need an
          expert or want to grow your business, Servizo makes it seamless.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
        >
          <Button
            href="/register/seeker"
            className="group bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 px-8 py-3.5 text-base rounded-xl flex items-center justify-center gap-2"
          >
            Find a Service
            <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
          </Button>

          <Button
            href="/register/provider"
            className="group bg-white text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 px-8 py-3.5 text-base rounded-xl flex items-center justify-center gap-2"
          >
            Offer a Service
            <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400"
        >
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-xs" />
              ))}
            </div>
            <span className="ml-1 text-gray-500 font-medium">4.9/5 Rating</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <span>Trusted by <strong className="text-gray-600">1,000+</strong> users</span>
          <div className="hidden sm:block w-px h-4 bg-gray-200" />
          <span><strong className="text-gray-600">500+</strong> Verified Providers</span>
        </motion.div>
      </div>
    </section>
  );
}
