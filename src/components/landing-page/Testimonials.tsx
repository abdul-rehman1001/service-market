"use client";

import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { motion, Variants } from "framer-motion";

export default function Testimonials() {
  const reviews = [
    {
      text: "I needed a plumber urgently, and I found one within an hour. Quick and reliable service!",
      name: "Farhan",
      role: "Homeowner",
      initials: "F",
      bg: "bg-emerald-100 text-emerald-700",
    },
    {
      text: "My car needed repair, and the mechanic I booked was professional and fast. Very satisfied!",
      name: "Umer",
      role: "Car Owner",
      initials: "U",
      bg: "bg-blue-100 text-blue-700",
    },
    {
      text: "Booking a house cleaner was quick and easy. He arrived on time and provided an excellent, reliable service.",
      name: "Ali",
      role: "Homeowner",
      initials: "A",
      bg: "bg-emerald-100 text-emerald-700",
    },
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
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
    <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/30 via-white to-blue-50/40 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute -top-32 -right-32 w-[450px] h-[450px] bg-emerald-100 rounded-full opacity-25 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-blue-100 rounded-full opacity-25 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-50 rounded-full opacity-20 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm tracking-wider uppercase mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-base md:text-lg">
            See what our users have to say about their experience on Servizo.
          </p>
        </div>

        {/* Review cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {reviews.map((review, i) => (
            <motion.div key={i} variants={cardVariants}>
              <div className="group relative bg-white border border-gray-100 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-1 hover:border-emerald-100 h-full flex flex-col">
                {/* Quote icon */}
                <FaQuoteLeft className="text-emerald-200 text-3xl mb-6" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} className="text-yellow-400 text-sm" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Reviewer Info */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${review.bg} flex items-center justify-center font-bold text-sm`}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      {review.name}
                    </h4>
                    <p className="text-gray-400 text-xs">{review.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
